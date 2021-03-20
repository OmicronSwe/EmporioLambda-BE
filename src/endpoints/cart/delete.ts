import { response, badResponse, badRequest } from '../../lib/APIResponses';
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

  const result = await Dynamo.delete(tableName.cart, 'email', event.pathParameters.email).catch(
    (err) => {
      //handle error of dynamoDB
      console.log(err);
      return null;
    }
  );

  if (!result) {
    return badResponse('Failed to empty the cart');
  }

  return response({ data: { message: 'Cart emptied' } });
};
