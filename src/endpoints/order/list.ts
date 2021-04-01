import { APIGatewayProxyHandler } from "aws-lambda";
import { response, notFound, badResponse } from "../../lib/APIResponses";
import Dynamo from "../../services/dynamo/dynamo";
import tableName from "../../services/dynamo/tableName";

export const index: APIGatewayProxyHandler = async () => {
  try {
    const result = await Dynamo.scan(tableName.order);
    if (result.items.length == 0) {
      return notFound("Orders not found");
    }

    return response({ data: { result } });
  } catch (error) {
    return badResponse("Failed to scan order");
  }
};
