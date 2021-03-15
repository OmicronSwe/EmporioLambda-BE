import { response, notFound, badResponse, badRequest } from '../../lib/APIResponses';
import Dynamo from '../../lib/dynamo';
import { APIGatewayProxyHandler } from 'aws-lambda';
import tableName from '../../lib/tableName';

export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.pathParameters) {
    return badRequest('PathParameters missing');
  }

  const result = await Dynamo.get('id', event.pathParameters.id, tableName.product).catch((err) => {
    console.log(err);
    return null;
  });

  if (!result) {
    return badResponse('Failed to get product');
  }

  if (Object.keys(result).length === 0) {
    return notFound('Product not found');
  }

  //console.log(result);
  return response({ data: { result } });
};
