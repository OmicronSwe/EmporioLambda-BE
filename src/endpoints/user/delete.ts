import { response, badResponse, badRequest, notFound } from '../../lib/APIResponses';
import { APIGatewayProxyHandler } from 'aws-lambda';
import tableName from '../../lib/tableName';
import { decodeURI } from '../../lib/decodeURISearch';
import Cognito from '../../lib/cognito';

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return badRequest('Body missing');
  }
  let accessToken: string;
  try {
    accessToken = JSON.parse(event.body).accessToken;
  } catch (err) {
    return badRequest(err.name + ' ' + err.message);
  }

  const result = await Cognito.deleteUser(accessToken).catch((err) => {
    //handle error of dynamoDB
    console.log(err);
    return null;
  });

  if (!result) {
    return badResponse('Failed to delete user');
  }

  return response({ data: { message: 'User deleted correctly' } });
};
