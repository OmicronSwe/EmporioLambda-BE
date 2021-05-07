import { APIGatewayProxyHandler } from "aws-lambda";
import {
  response,
  notFound,
  badResponse,
  badRequest,
} from "../../lib/APIResponses";
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
    const result = await Dynamo.query(
      tableName.order,
      "username_id_index",
      ["username", "id"],
      [event.pathParameters.username, event.pathParameters.id],
      "#element0 = :Value0 AND #element1 = :Value1"
    );

    if (result.items.length == 0) {
      return notFound("Order not found for this user");
    }

    return response({ data: { result } });
  } catch (error) {
    return badResponse("Failed to get order");
  }
};
