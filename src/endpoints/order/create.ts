import { APIGatewayProxyHandler } from "aws-lambda";
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
import Product from "../../model/product/product";
import Stripe from "../../services/stripe/stripe";
import Nodemailer from "../../services/nodemailer/nodemailer";
import User, { DynamoFormat } from "../../model/user";
import Cognito from "../../services/cognito/cognito";
import { CartDB } from "../../model/cart/interface";

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  // console.log(event);
  if (!event.body) {
    return badRequest("Body missing");
  }

  const webhookStripe = JSON.parse(event.body).data.object;

  if (webhookStripe.payment_status == "paid") {
    const result: CartDB = await Dynamo.get(
      tableName.cart,
      "username",
      webhookStripe.client_reference_id
    ).catch((err) => {
      // handle error of dynamoDB
      console.log(err);
      return null;
    });

    if (!result) {
      return badResponse("Failed to get cart");
    }

    if (Object.keys(result).length === 0) {
      return notFound("Cart not found");
    }

    let cart: Cart;
    let order: Order;

    // push data to dynamodb
    try {
      cart = new Cart(result);
      order = new Order(cart, webhookStripe.customer_details.email);

      const data = order.toJSON();

      const newOrder = await Dynamo.write(tableName.order, data).catch(
        (err) => {
          // handle error of dynamoDB
          console.log(err);
          return null;
        }
      );

      if (!newOrder) {
        return badResponse("Failed to receive order");
      }
    } catch (err) {
      // handle logic error
      return badRequest(`${err.name} ${err.message}`);
    }

    // empty the cart
    const data = {
      username: cart.username,
      products: [],
    };

    const resultCartEmpty = await Dynamo.write(tableName.cart, data).catch(
      (err) => {
        // handle error of dynamoDB
        console.log(err);
        return null;
      }
    );

    if (!resultCartEmpty) {
      return badResponse("Failed to empty the cart");
    }

    // get user name
    const resultUser: DynamoFormat[] = await Cognito.getUserAttributes(
      cart.username
    ).catch((err) => {
      // handle error of dynamoDB
      console.log(err);
      return null;
    });

    if (!resultUser) {
      return badResponse("Failed to get user data");
    }

    const user = User.fromDynamoFormat(resultUser);

    // send email;
    try {
      await Nodemailer.sendEmailProduct(
        cart.products,
        webhookStripe.customer_details.email,
        cart.totalPrice,
        user.name
      );
    } catch (error) {
      return badResponse("Failed to send email order");
    }

    return response({ data: { message: "Order recevied" } });
  }
  return badResponse("Failed to create order");
};
