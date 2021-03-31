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
import Nodemailer from "../../services/nodemailer/nodemailer";
import User from "../../model/user/user";
import Cognito from "../../services/cognito/cognito";
import { CartDB } from "../../model/cart/interface";
import { OrderDB } from "../../model/order/interface";
import { CognitoFormat } from "../../model/user/interface";

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
    ).catch(() => {
      // handle error of dynamoDB
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

      const data: OrderDB = order.toJSON();

      const newOrder = await Dynamo.write(tableName.order, data).catch(() => {
        // handle error of dynamoDB
        return null;
      });

      if (!newOrder) {
        return badResponse("Failed to receive order");
      }
    } catch (err) {
      // handle logic error of cart and order
      return badRequest(`${err.name} ${err.message}`);
    }

    // empty the cart
    const data = {
      username: cart.username,
      products: [],
    };

    const resultCartEmpty = await Dynamo.write(tableName.cart, data).catch(
      () => {
        // handle error of dynamoDB
        return null;
      }
    );

    if (!resultCartEmpty) {
      return badResponse("Failed to empty the cart");
    }

    // get user name
    console.log("getUsername");
    console.log(cart.username);
    const resultUser: CognitoFormat[] = await Cognito.getUserAttributes(
      cart.username
    ).catch(() => {
      // handle error of dynamoDB
      return null;
    });

    if (!resultUser) {
      return badResponse("Failed to get user data");
    }

    const user = User.fromCognitoFormat(resultUser);

    // send email;
    console.log("send email");
    console.log(user.name);
    return await Nodemailer.sendEmailProduct(
      cart.products,
      webhookStripe.customer_details.email,
      cart.totalPrice,
      user.name
    )
      .then(() => {
        console.log("return good");
        return response({ data: { message: "Order recevied" } });
      })
      .catch(() => {
        console.log("return false");
        return badResponse("Failed to send email order");
      });
  }
  return badResponse("Failed to create order");
};
