import { response, badResponse, badRequest } from '../../lib/APIResponses';
import Dynamo from '../../lib/dynamo';
import { APIGatewayProxyHandler } from 'aws-lambda';
import tableName from '../../lib/tableName';

export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.pathParameters) {
    return badRequest('PathParameters missing');
  }

  const result = await Dynamo.delete('id', event.pathParameters.id, tableName.product).catch(
    (err) => {
      console.log(err);
      return null;
    }
  );

  if (!result) {
    return badResponse('Failed to delete product');
  }

  return response({ data: { message: 'Product deleted correctly' } });
};
