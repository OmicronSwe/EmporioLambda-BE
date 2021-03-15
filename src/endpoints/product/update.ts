import { response, badRequest, badResponse } from '../../lib/APIResponses';
import Dynamo from '../../lib/dynamo';
import { APIGatewayProxyHandler } from 'aws-lambda';
import tableName from '../../lib/tableName';

export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return badRequest('Body missing');
  }

  if (!event.pathParameters) {
    return badRequest('PathParameters missing');
  }

  const body = JSON.parse(event.body);

  const result = await Dynamo.update(
    tableName.product,
    'id',
    event.pathParameters.id,
    Object.keys(body),
    Object.values(body)
  ).catch((err) => {
    console.log(err);
    return null;
  });

  if (!result) {
    return badResponse('Failed to update product');
  }

  return response({ data: { message: 'Product updated correctly' } });
};
