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

  const result = await Dynamo.delete(tableName.category, 'name', event.pathParameters.name).catch(
    (err) => {
      //handle error of dynamoDB
      console.log(err);
      return null;
    }
  );

  if (!result) {
    return badResponse('Failed to delete category');
  }

  return response({ data: { message: 'Category deleted correctly' } });
};
