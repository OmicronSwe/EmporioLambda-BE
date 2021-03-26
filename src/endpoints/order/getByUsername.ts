import { response, notFound, badResponse, badRequest } from '../../lib/APIResponses';
import Dynamo from '../../lib/dynamo';
import { APIGatewayProxyHandler } from 'aws-lambda';
import tableName from '../../lib/tableName';

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.pathParameters) {
    return badRequest('PathParameters missing');
  }

  let keys: Array<string> = [];
  let valueKeys: Array<string> = [];

  keys.push('username');
  valueKeys.push(event.pathParameters.username);

  const result = await Dynamo.query(
    tableName.order,
    'username_date_index',
    keys,
    valueKeys,
    '#element0 = :Value0'
  ).catch((err) => {
    //handle error of dynamoDB
    console.log(err);
    return null;
  });

  if (!result) {
    return badResponse('Failed to get orders');
  }

  if (result.items.length == 0) {
    return notFound('Orders not found');
  }

  return response({ data: { result } });
};
