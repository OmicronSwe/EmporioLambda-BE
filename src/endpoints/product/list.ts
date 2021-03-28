import { APIGatewayProxyHandler } from "aws-lambda";
import { response, notFound, badResponse } from "../../lib/APIResponses";
import Dynamo from "../../services/dynamo/dynamo";
import tableName from "../../services/dynamo/tableName";

export const index: APIGatewayProxyHandler = async () => {
  const result = await Dynamo.scan(tableName.product).catch(() => {
    // handle error of dynamoDB
    return null;
  });

  if (!result) {
    return badResponse("Failed to scan product");
  }

  if (result.items.length == 0) {
    return notFound("Products not found");
  }

  return response({ data: { result } });
};
