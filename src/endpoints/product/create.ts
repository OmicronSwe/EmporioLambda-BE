import { response, badRequest } from '../../lib/APIResponses';
import Dynamo from '../../lib/dynamo';
import { APIGatewayProxyHandler } from 'aws-lambda';
import tableName from '../../lib/tableName';
import { v4 as uuid } from 'uuid';

export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return badRequest('Body missing');
  }

  const body = JSON.parse(event.body);

  const data = {
    id: uuid(),
    name: body.name,
    description: body.description,
  };

  const newProduct = await Dynamo.write(data, tableName.product).catch((err) => {
    console.log('error in Dynamo write', err);
    return null;
  });

  if (!newProduct) {
    return badRequest('Failed to create product');
  }

  return response({ data: { message: 'Product "' + body.name + '" created correctly' } });
};
