import { APIGatewayProxyHandler } from "aws-lambda";
import {
  response,
  notFound,
  badResponse,
  badRequest,
} from "../../lib/APIResponses";
import Dynamo from "../../services/dynamo/dynamo";

import Cart from "../../model/cart/cart";
import Product from "../../model/product/product";
import { ProductDB } from "../../model/product/interface";

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.pathParameters) {
    return badRequest("PathParameters missing");
  }

  let resultCart;

  try {
    resultCart = await Dynamo.get(
      process.env.CART_TABLE,
      "username",
      event.pathParameters.username
    );

    if (Object.keys(resultCart).length === 0) {
      return notFound("Cart not found");
    }
  } catch (error) {
    return badResponse("Failed to get cart");
  }

  const messageChange: Array<string> = new Array<string>();
  const cart: Cart = new Cart(resultCart);

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
        messageChange.push(
          `Product "${cartProductList[i].getName()}" no longer available`
        );
        cart.removeProductTotally(cartProductList[i]);
      } else {
        // console.log(result);
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
          cart.updateProduct(cartProductList[i], prodFromDb);
          messageChange.push(
            `"${cartProductList[i].getName()}" product has been modified`
          );
        }
      }
    } catch (error) {
      return badResponse("Failed to get product");
    }
  }

  const result = cart.toJSON();

  return response({ data: { result, messageChange } });
};
