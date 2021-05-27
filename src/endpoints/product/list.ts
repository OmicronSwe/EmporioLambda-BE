import { APIGatewayProxyHandler } from "aws-lambda";
import { response, notFound, badResponse } from "../../lib/APIResponses";
import Dynamo from "../../services/dynamo/dynamo";

export const index: APIGatewayProxyHandler = async () => {
  try {
    const result = await Dynamo.scan(process.env.PRODUCT_TABLE);
    if (result.items.length == 0) {
      return notFound("Products not found");
    }

    return response({ data: { result } });
  } catch (error) {
    return badResponse("Failed to scan product");
  }
};
