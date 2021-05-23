import { APIGatewayProxyHandler } from "aws-lambda";
import Stripe from "stripe";
import {
  response,
  badRequest,
  badResponse,
  notFound,
} from "../../lib/APIResponses";
import Dynamo from "../../services/dynamo/dynamo";
import StripeService from "../../services/stripe/stripe";
import Order from "../../model/order/order";
import Cart from "../../model/cart/cart";
import Nodemailer from "../../services/nodemailer/nodemailer";
import User from "../../model/user/user";
import Cognito from "../../services/cognito/cognito";

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return badRequest("Body missing");
  }

  // If signing key is set, check the signature of the request.
  if (
    process.env.STRIPE_SECRET_SIGNING &&
    process.env.STRIPE_SECRET_SIGNING != "undefined"
  ) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2020-08-27",
    });
    const sig = event.headers["Stripe-Signature"];
    try {
      stripe.webhooks.constructEvent(
        event.body,
        sig,
        process.env.STRIPE_SECRET_SIGNING
      );
    } catch {
      return badRequest("Request not signed by stripe");
    }
  }

  const webhookStripe: Stripe.Checkout.Session = JSON.parse(event.body).data
    .object;

  if (webhookStripe.payment_status == "paid") {
    let result;

    try {
      result = await Dynamo.get(
        process.env.CART_TABLE,
        "username",
        webhookStripe.client_reference_id
      );

      if (Object.keys(result).length === 0) {
        return notFound("Cart not found");
      }
    } catch (error) {
      return badResponse("Failed to get cart");
    }

    let cart: Cart;
    let order: Order;

    // push data to dynamodb
    try {
      cart = new Cart(result);
      order = new Order(cart, webhookStripe.customer_details.email);
    } catch (err) {
      // handle logic error of cart and order
      return badRequest(`${err.name} ${err.message}`);
    }

    try {
      const data = order.toJSON();
      await Dynamo.write(process.env.ORDER_TABLE, data);
    } catch (error) {
      return badResponse("Failed to receive order");
    }

    // empty the cart
    const data = {
      username: cart.getUsername(),
      products: [],
    };

    try {
      await Dynamo.write(process.env.CART_TABLE, data);
    } catch (error) {
      return badResponse("Failed to empty the cart");
    }

    // get user name
    let user: User;
    try {
      const resultUser = await Cognito.getUserAttributes(cart.getUsername());

      user = User.fromCognitoFormat(resultUser);
    } catch (error) {
      return badResponse("Failed to get user data");
    }

    // send email;
    const resp = await Nodemailer.sendEmailProduct(
      cart.getProducts(),
      webhookStripe.customer_details.email,
      cart.getTotalPrice(),
      user.getName()
    );

    // modify email on stripe if is different
    if (webhookStripe.customer_details.email !== user.getEmail()) {
      StripeService.updateCustomerEmail(
        webhookStripe.customer.toString(),
        user.getEmail()
      );
    }

    if (resp) {
      return response({ data: { message: "Order recevied" } });
    }

    return badResponse("Failed to send email order");
  }
  return badResponse("Failed to create order");
};
