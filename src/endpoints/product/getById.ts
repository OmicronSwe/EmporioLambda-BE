import { response, notFound, badResponse, badRequest } from '../../lib/APIResponses';
import Dynamo from '../../services/dynamo/dynamo';
import { APIGatewayProxyHandler } from 'aws-lambda';
import tableName from '../../services/dynamo/tableName';

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.pathParameters) {
    return badRequest('PathParameters missing');
  }

  const result = await Dynamo.get(tableName.product, 'id', event.pathParameters.id).catch((err) => {
    //handle error of dynamoDB
    console.log(err);
    return null;
  });

  if (!result) {
    return badResponse('Failed to get product');
  }

  if (Object.keys(result).length === 0) {
    return notFound('Product not found');
  }

  return response({ data: { result } });
};
