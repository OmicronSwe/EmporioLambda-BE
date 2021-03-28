import { APIGatewayProxyHandler } from "aws-lambda";
import { response, notFound, badResponse } from "../../lib/APIResponses";
import Dynamo from "../../services/dynamo/dynamo";
import tableName from "../../services/dynamo/tableName";

export const index: APIGatewayProxyHandler = async () => {
  const result = await Dynamo.scan(tableName.category).catch((err) => {
    // handle error of dynamoDB
    console.log(err);
    return null;
  });

  if (!result) {
    return badResponse("Failed to scan categories");
  }

  if (result.items.length == 0) {
    return notFound("Categories not found");
  }

  const categoriesList: string[] = [];

  result.items.forEach((item) => {
    categoriesList.push(item.name);
  });

  return response({ data: { result: { items: categoriesList } } });
};
