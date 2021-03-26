import { response, badResponse, badRequest } from '../../lib/APIResponses';
import Dynamo from '../../services/dynamo/dynamo';
import { APIGatewayProxyHandler } from 'aws-lambda';
import tableName from '../../services/dynamo/tableName';
import { CartDB } from '../../model/cart/interface';

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.pathParameters) {
    return badRequest('PathParameters missing');
  }

  const data: CartDB = {
    username: event.pathParameters.username,
    products: [],
  };

  const result = await Dynamo.write(tableName.cart, data).catch((err) => {
    //handle error of dynamoDB
    console.log(err);
    return null;
  });

  if (!result) {
    return badResponse('Failed to empty the cart');
  }

  return response({ data: { message: 'Cart emptied' } });
};
