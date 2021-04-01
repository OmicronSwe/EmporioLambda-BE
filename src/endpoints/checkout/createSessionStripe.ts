import { APIGatewayProxyHandler } from "aws-lambda";
import {
  response,
  badRequest,
  badResponse,
  notFound,
} from "../../lib/APIResponses";
import Dynamo from "../../services/dynamo/dynamo";
import tableName from "../../services/dynamo/tableName";
import Cart from "../../model/cart/cart";
import Product from "../../model/product/product";
import Stripe from "../../services/stripe/stripe";
import { ProductDB } from "../../model/product/interface";

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return badRequest("Body missing");
  }

  const body = JSON.parse(event.body);

  let result;

  try {
    result = await Dynamo.get(tableName.cart, "username", body.username);

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
        tableName.product,
        "id",
        cartProductList[i].id
      );

      if (Object.keys(result).length === 0) {
        return notFound(
          "Some products are no longer available, please check your shopping cart before proceeding"
        );
      }
      const prodFromDb = new Product(result);

      if (cartProductList[i].isDifference(prodFromDb)) {
        return badResponse(
          "Some products have changed, please check your shopping cart before proceeding"
        );
      }
    } catch (error) {
      return badResponse("Failed to get product");
    }
  }

  // create stripe session
  try {
    const idSession = await Stripe.createSession(
      cart,
      body.successurl,
      body.cancelurl
    );
    return response({ data: { sessionId: idSession } });
  } catch (error) {
    return badResponse("Enable to create sessione of Stripe");
  }
};
