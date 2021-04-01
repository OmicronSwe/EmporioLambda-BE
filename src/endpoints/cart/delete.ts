import { APIGatewayProxyHandler } from "aws-lambda";
import { response, badResponse, badRequest } from "../../lib/APIResponses";
import Dynamo from "../../services/dynamo/dynamo";
import tableName from "../../services/dynamo/tableName";

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.pathParameters) {
    return badRequest("PathParameters missing");
  }

  try {
    await Dynamo.delete(
      tableName.cart,
      "username",
      event.pathParameters.username
    );

    return response({ data: { message: "Cart deleted" } });
  } catch (error) {
    return badResponse("Failed to delete the cart");
  }
};
