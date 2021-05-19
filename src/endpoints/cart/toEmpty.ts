import { APIGatewayProxyHandler } from "aws-lambda";
import { response, badResponse, badRequest } from "../../lib/APIResponses";
import Dynamo from "../../services/dynamo/dynamo";

import { CartDB } from "../../model/cart/interface";

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.pathParameters) {
    return badRequest("PathParameters missing");
  }

  const data: CartDB = {
    username: event.pathParameters.username,
    products: [],
  };

  try {
    await Dynamo.write(process.env.CART_TABLE, data);
    return response({ data: { message: "Cart emptied" } });
  } catch (error) {
    return badResponse("Failed to empty the cart");
  }
};
