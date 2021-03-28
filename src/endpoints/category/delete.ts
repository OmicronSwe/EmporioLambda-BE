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

  const scanCategory = await Dynamo.scan(
    tableName.product,
    "#element0 = :Value0",
    ["category"],
    [event.pathParameters.name]
  ).catch(() => {
    // handle error of dynamoDB
    return null;
  });

  if (!scanCategory) {
    return badResponse("Failed to scan category");
  }

  if (scanCategory.items.length >= 1) {
    return badRequest("Category is being used");
  }

  return await Dynamo.delete(
    tableName.category,
    "name",
    decodeURIComponent(event.pathParameters.name)
  )
    .then(() => {
      return response({ data: { message: "Category deleted correctly" } });
    })
    .catch(() => {
      // handle error of dynamoDB
      return badResponse("Failed to delete category");
    });
};
