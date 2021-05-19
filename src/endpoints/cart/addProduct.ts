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
import { UpdateProductInCartRequest } from "../../model/cart/interface";

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return badRequest("Body missing");
  }

  if (!event.pathParameters) {
    return badRequest("PathParameters missing");
  }

  const body: UpdateProductInCartRequest = JSON.parse(event.body);

  // get Informations cart
  let resultGetCart;
  let resultGetProduct;

  try {
    resultGetCart = await Dynamo.get(
      process.env.CART_TABLE,
      "username",
      event.pathParameters.username
    );

    if (Object.keys(resultGetCart).length === 0) {
      resultGetCart.username = event.pathParameters.username;
    }
  } catch (error) {
    return badResponse("Failed to get cart");
  }

  // get info from product id
  try {
    resultGetProduct = await Dynamo.get(
      process.env.PRODUCT_TABLE,
      "id",
      body.id
    );

    if (Object.keys(resultGetProduct).length === 0) {
      return notFound("Product not found");
    }
  } catch (error) {
    return badResponse("Failed to get product");
  }

  const prod: Product = new Product(resultGetProduct);

  const cartFromDB: Cart = new Cart(resultGetCart);

  cartFromDB.addProduct(prod, body.quantity ? body.quantity : 1);

  try {
    await Dynamo.write(process.env.CART_TABLE, cartFromDB.toJSON());
    return response({
      data: { message: `Product "${prod.getName()}" added to cart` },
    });
  } catch (error) {
    return badResponse(`Failed to add product "${prod.getName()}" to cart`);
  }
};
