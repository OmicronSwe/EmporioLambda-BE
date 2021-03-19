import { response, badRequest, badResponse } from '../../lib/APIResponses';
import Dynamo from '../../lib/dynamo';
import { APIGatewayProxyHandler } from 'aws-lambda';
import tableName from '../../lib/tableName';
import Order from '../../lib/model/order';

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
    const order = new Order(body);
    const data = order.getData();

    const newOrder = await Dynamo.write(tableName.order, data).catch((err) => {
      //handle error of dynamoDB
      console.log(err);
      return null;
    });

    if (!newOrder) {
      return badResponse('Failed to receive order');
    }

    return response({ data: { message: 'Order receive' } });
  } catch (err) {
    //handle logic error of order
    return badRequest(err.name + ' ' + err.message);
  }
};
