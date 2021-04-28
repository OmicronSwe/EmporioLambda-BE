import { APIGatewayProxyHandler } from "aws-lambda";
import Stripe from "stripe";
import {
  response,
  badRequest,
  badResponse,
  notFound,
} from "../../lib/APIResponses";
import Dynamo from "../../services/dynamo/dynamo";
import tableName from "../../services/dynamo/tableName";
import Order from "../../model/order/order";
import Cart from "../../model/cart/cart";
import Nodemailer from "../../services/nodemailer/nodemailer";
import User from "../../model/user/user";
import Cognito from "../../services/cognito/cognito";

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  // console.log(event);
  if (!event.body) {
    return badRequest("Body missing");
  }

  const webhookStripe: Stripe.Checkout.Session = JSON.parse(event.body).data
    .object;

  if (webhookStripe.payment_status == "paid") {
    let result;

    try {
      result = await Dynamo.get(
        tableName.cart,
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
      await Dynamo.write(tableName.order, data);
    } catch (error) {
      return badResponse("Failed to receive order");
    }

    // empty the cart
    const data = {
      username: cart.getUsername(),
      products: [],
    };

    try {
      await Dynamo.write(tableName.cart, data);
    } catch (error) {
      return badResponse("Failed to empty the cart");
    }

    // get user name
    let userName: string;
    try {
      const resultUser = await Cognito.getUserAttributes(cart.getUsername());

      userName = User.fromCognitoFormat(resultUser).getName();
    } catch (error) {
      return badResponse("Failed to get user data");
    }

    // send email;
    const resp = await Nodemailer.sendEmailProduct(
      cart.getProducts(),
      webhookStripe.customer_details.email,
      cart.getTotalPrice(),
      userName
    );

    if (resp) {
      return response({ data: { message: "Order recevied" } });
    }

    return badResponse("Failed to send email order");
  }
  return badResponse("Failed to create order");
};
