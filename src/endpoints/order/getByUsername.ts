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

  const result = await Dynamo.query(
    tableName.order,
    "username_date_index",
    ["username"],
    [event.pathParameters.username],
    "#element0 = :Value0"
  ).catch(() => {
    // handle error of dynamoDB
    return null;
  });

  if (!result) {
    return badResponse("Failed to get orders");
  }

  if (result.items.length == 0) {
    return notFound("Orders not found");
  }

  return response({ data: { result } });
};
