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

  try {
    resultGetCart = await Dynamo.get(
      tableName.cart,
      "username",
      event.pathParameters.username
    );

    if (Object.keys(resultGetCart).length === 0) {
      return notFound("Cart not found");
    }
  } catch (error) {
    return badResponse("Failed to get cart");
  }

  const cartFromDB: Cart = new Cart(resultGetCart);

  const prod: Product = cartFromDB.getProductFromId(body.id);

  if (!prod) {
    return notFound("Product not found in the cart");
  }

  if (body.quantity) {
    cartFromDB.removeProductByQuantity(prod, body.quantity);
  } else {
    cartFromDB.removeProductTotally(prod);
  }

  try {
    await Dynamo.write(tableName.cart, cartFromDB.toJSON());
    return response({
      data: { message: `Product "${prod.getName()}" removed from cart` },
    });
  } catch (error) {
    return badResponse(`Failed to remove product "${prod.getName()}" from cart`);
  }
};
