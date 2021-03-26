import { response, badResponse, badRequest, notFound } from '../../lib/APIResponses';
import { APIGatewayProxyHandler } from 'aws-lambda';
import tableName from '../../services/dynamo/tableName';
import { decodeURI } from '../../lib/decodeURISearch';
import Cognito from '../../services/cognito/cognito';

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.pathParameters) {
    return badRequest('PathParameters missing');
  }

  const result = await Cognito.deleteUser(event.pathParameters.username).catch((err) => {
    //handle error of dynamoDB
    console.log(err);
    return null;
  });

  if (!result) {
    return badResponse('Failed to delete user');
  }

  return response({ data: { message: 'User deleted correctly' } });
};
