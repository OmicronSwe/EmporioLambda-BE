import { APIGatewayProxyHandler } from "aws-lambda";
import {
  response,
  notFound,
  badResponse,
  badRequest,
} from "../../lib/APIResponses";
import Dynamo from "../../services/dynamo/dynamo";
import tableName from "../../services/dynamo/tableName";
import Cart from "../../model/cart/cart";
import Product from "../../model/product/product";
import { CartDB } from "../../model/cart/interface";
import { ProductDB } from "../../model/product/interface";

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.pathParameters) {
    return badRequest("PathParameters missing");
  }

  const resultCart: CartDB = await Dynamo.get(
    tableName.cart,
    "username",
    event.pathParameters.username
  ).catch(() => {
    // handle error of dynamoDB
    return null;
  });

  if (!resultCart) {
    return badResponse("Failed to get cart");
  }

  if (Object.keys(resultCart).length === 0) {
    return notFound("Cart not found");
  }

  const messageChange: Array<string> = new Array<string>();
  const cart: Cart = new Cart(resultCart);

  // check if products exist and are modify
  const cartProductList: Array<Product> = cart.getProductsList();
  for (let i = 0; i < cartProductList.length; i++) {
    const result: ProductDB = await Dynamo.get(
      tableName.product,
      "id",
      cartProductList[i].id
    ).catch(() => {
      // handle error of dynamoDB
      return null;
    });

    if (!result) {
      return badResponse("Failed to get product");
    }

    if (Object.keys(result).length === 0) {
      messageChange.push(
        `Product "${cartProductList[i].name}" no longer available`
      );
      cart.removeProductTotally(cartProductList[i]);
    } else {
      // console.log(result);
      const prodFromDb = new Product(result);

      if (cartProductList[i].isDifference(prodFromDb)) {
        cart.updateProduct(cartProductList[i], prodFromDb);
        messageChange.push(
          `"${cartProductList[i].name}" product has been modified`
        );
      }
    }
  }

  const result = cart.toJSON();

  return response({ data: { result, messageChange } });
};
