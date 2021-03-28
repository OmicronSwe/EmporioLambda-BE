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
  ).catch((err) => {
    // handle error of dynamoDB
    console.log(err);
    return null;
  });

  if (!resultCart) {
    return badResponse("Failed to get cart");
  }

  if (Object.keys(resultCart).length === 0) {
    return notFound("Cart not found");
  }

  let change: boolean = false;
  const messageChange: Array<string> = new Array<string>();
  const cart: Cart = new Cart(resultCart);

  // check if products exist and are modify
  for (const productCart of cart.getProductsList()) {
    const result: ProductDB = await Dynamo.get(
      tableName.product,
      "id",
      productCart.id
    ).catch((err) => {
      // handle error of dynamoDB
      console.log(err);
      return null;
    });

    if (!result) {
      return badResponse("Failed to get product");
    }

    if (Object.keys(result).length === 0) {
      change = true;
      messageChange.push(`Product "${productCart.name}" no longer available`);
      cart.removeProductTotally(productCart);
    } else {
      // console.log(result);
      const prodFromDb = new Product(result);

      if (productCart.isDifference(prodFromDb)) {
        cart.updateProduct(productCart, prodFromDb);
        change = true;
        messageChange.push(`"${productCart.name}" product has been modified`);
      }
    }
  }

  const result = cart.toJSON();

  // console.log(result);

  return response({ data: { result, messageChange } });
};
