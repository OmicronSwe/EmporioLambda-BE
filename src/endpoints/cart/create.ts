import { response, badRequest, badResponse } from '../../lib/APIResponses';
import Dynamo from '../../lib/dynamo';
import { APIGatewayProxyHandler } from 'aws-lambda';
import tableName from '../../lib/tableName';
import Cart from '../../lib/model/Cart';

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return badRequest('Body missing');
  }

  const body = JSON.parse(event.body);

  //push data to dynamodb
  try {
    const cart = new Cart(body);
    const data = cart.getData();

    const newCart = await Dynamo.write(tableName.cart, data).catch((err) => {
      //handle error of dynamoDB
      console.log(err);
      return null;
    });

    if (!newCart) {
      return badResponse('Failed to save cart');
    }

    return response({ data: { message: 'Cart saved' } });
  } catch (err) {
    //handle logic error of order
    return badRequest(err.name + ' ' + err.message);
  }
};
