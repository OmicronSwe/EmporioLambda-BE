import { APIGatewayProxyHandler } from "aws-lambda";
import {
  response,
  badRequest,
  badResponse,
  notFound,
} from "../../lib/APIResponses";
import Dynamo from "../../services/dynamo/dynamo";

import Cart from "../../model/cart/cart";
import Product from "../../model/product/product";
import Stripe from "../../services/stripe/stripe";
import { CreateSessionStripeRequest } from "../../model/checkout/interface";
import { ProductDB } from "../../model/product/interface";
import Cognito from "../../services/cognito/cognito";
import User from "../../model/user/user";

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return badRequest("Body missing");
  }

  const body: CreateSessionStripeRequest = JSON.parse(event.body);

  let result;

  try {
    result = await Dynamo.get(
      process.env.CART_TABLE,
      "username",
      body.username
    );

    if (Object.keys(result).length === 0) {
      return notFound("Cart not found");
    }
  } catch (error) {
    return badResponse("Failed to get cart");
  }

  const cart: Cart = new Cart(result);

  // check if products exist and are modify
  const cartProductList: Array<Product> = cart.getProductsList();
  for (let i = 0; i < cartProductList.length; i++) {
    try {
      const result = await Dynamo.get(
        process.env.PRODUCT_TABLE,
        "id",
        cartProductList[i].getId()
      );

      if (Object.keys(result).length === 0) {
        return notFound(
          "Some products are no longer available, please check your shopping cart before proceeding"
        );
      }

      const productDb: ProductDB = {
        id: result.id,
        name: result.name,
        description: result.description,
        imageUrl: result.imageUrl,
        price: result.price,
        category: result.category,
      };

      const prodFromDb = new Product(productDb);

      if (cartProductList[i].isDifference(prodFromDb)) {
        return badResponse(
          "Some products have changed, please check your shopping cart before proceeding"
        );
      }
    } catch (error) {
      return badResponse("Failed to get product");
    }
  }

  // get User email
  let user: User;
  try {
    const result = await Cognito.getUserAttributes(body.username);

    console.log(result); // eslint-disable-line no-console

    user = User.fromCognitoFormat(result);
  } catch (error) {
    console.log(error); // eslint-disable-line no-console
    return badResponse("Failed to get user email");
  }

  // create user on stripe
  let idCustomer: string;
  try {
    idCustomer = await Stripe.createCustomer(user.getName(), user.getEmail());
  } catch (error) {
    console.log(error); // eslint-disable-line no-console
    return badResponse("Enable to create user on stripe");
  }

  // create stripe session
  try {
    const idSession = await Stripe.createSession(
      cart,
      idCustomer,
      body.successurl,
      body.cancelurl
    );
    return response({ data: { sessionId: idSession } });
  } catch (error) {
    return badResponse("Enable to create sessione of Stripe");
  }
};
