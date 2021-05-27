import { APIGatewayProxyHandler } from "aws-lambda";
import { response, notFound, badResponse } from "../../lib/APIResponses";
import Dynamo from "../../services/dynamo/dynamo";

export const index: APIGatewayProxyHandler = async () => {
  let result;
  try {
    result = await Dynamo.scan(process.env.CATEGORY_TABLE);
    if (result.items.length == 0) {
      return notFound("Categories not found");
    }
  } catch (error) {
    return badResponse("Failed to scan categories");
  }

  const categoriesList: string[] = [];

  result.items.forEach((item) => {
    categoriesList.push(item.name);
  });

  return response({ data: { result: { items: categoriesList } } });
};
