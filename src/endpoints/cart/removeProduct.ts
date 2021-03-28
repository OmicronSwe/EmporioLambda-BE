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
import { ProductForCartDB } from "../../model/product/interface";

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

  const body: ProductForCartDB = JSON.parse(event.body);

  // get Informations cart
  const resultGetCart = await Dynamo.get(
    tableName.cart,
    "username",
    event.pathParameters.username
  ).catch((err) => {
    // handle error of dynamoDB
    console.log(err);
    return null;
  });

  if (!resultGetCart) {
    return badResponse("Failed to get cart");
  }

  if (Object.keys(resultGetCart).length === 0) {
    return notFound("Cart not found");
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

  const newCart = await Dynamo.write(tableName.cart, cartFromDB.toJSON()).catch(
    (err) => {
      // handle error of dynamoDB
      console.log(err);
      return null;
    }
  );

  if (!newCart) {
    return badResponse(`Failed to remove product "${prod.name}" from cart`);
  }

  return response({
    data: { message: `Product "${prod.name}" removed from cart` },
  });
};
