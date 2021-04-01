import { APIGatewayProxyHandler } from "aws-lambda";
import { response, badResponse, badRequest } from "../../lib/APIResponses";
import Dynamo from "../../services/dynamo/dynamo";
import tableName from "../../services/dynamo/tableName";
import { createCartRequest } from "../../model/cart/interface";

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.pathParameters) {
    return badRequest("PathParameters missing");
  }

  const data: createCartRequest = {
    username: event.pathParameters.username,
    products: [],
  };

  try {
    await Dynamo.write(tableName.cart, data);
    return response({ data: { message: "Cart emptied" } });
  } catch (error) {
    return badResponse("Failed to empty the cart");
  }
};
