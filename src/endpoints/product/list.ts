import { response, badResponse } from '../../lib/APIResponses';
import Dynamo from '../../lib/dynamo';
import { APIGatewayProxyHandler } from 'aws-lambda';
import tableName from '../../lib/tableName';

export const index: APIGatewayProxyHandler = async (event) => {
  const result = await Dynamo.scan(tableName.product).catch((err) => {
    console.log('error in Dynamo query: ', err);
    return null;
  });

  if (!result) {
    return badResponse('Failed to scan product');
  }

  return response({ data: { result } });
};
