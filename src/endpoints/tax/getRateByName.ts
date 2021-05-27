import { APIGatewayProxyHandler } from "aws-lambda";
import {
  response,
  notFound,
  badResponse,
  badRequest,
} from "../../lib/APIResponses";
import Dynamo from "../../services/dynamo/dynamo";

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.pathParameters) {
    return badRequest("PathParameters missing");
  }

  try {
    const result = await Dynamo.get(
      process.env.TAX_TABLE,
      "name",
      event.pathParameters.name
    );

    if (Object.keys(result).length === 0) {
      return notFound("Tax not found");
    }

    return response({ data: { rate: result.rate } });
  } catch (error) {
    return badResponse("Failed to get tax");
  }
};
