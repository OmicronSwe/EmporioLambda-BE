import { APIGatewayProxyHandler } from "aws-lambda";
import { response, badResponse, badRequest } from "../../lib/APIResponses";
import Dynamo from "../../services/dynamo/dynamo";

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.pathParameters) {
    return badRequest("PathParameters missing");
  }

  try {
    const scanCategory = await Dynamo.scan(
      process.env.PRODUCT_TABLE,
      "#element0 = :Value0",
      ["category"],
      [event.pathParameters.name]
    );

    if (scanCategory.items.length >= 1) {
      return badRequest("Category is being used");
    }
  } catch (error) {
    return badResponse("Failed to scan category");
  }

  try {
    await Dynamo.delete(
      process.env.CATEGORY_TABLE,
      "name",
      decodeURIComponent(event.pathParameters.name)
    );
    return response({ data: { message: "Category deleted correctly" } });
  } catch (error) {
    return badResponse("Failed to delete category");
  }
};
