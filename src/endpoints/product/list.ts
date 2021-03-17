import { response, notFound, badResponse } from '../../lib/APIResponses';
import Dynamo from '../../lib/dynamo';
import { APIGatewayProxyHandler } from 'aws-lambda';
import tableName from '../../lib/tableName';

export const index: APIGatewayProxyHandler = async () => {
  const result = await Dynamo.scan(tableName.product).catch((err) => {
    //handle error of dynamoDB
    console.log(err);
    return null;
  });

  if (!result) {
    return badResponse('Failed to scan product');
  }

  if (result.length == 0) {
    return notFound('Products not found');
  }

  return response({ data: { result } });
};
