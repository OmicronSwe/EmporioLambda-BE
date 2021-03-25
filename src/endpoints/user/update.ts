import { response, notFound, badResponse, badRequest } from '../../lib/APIResponses';
import Cognito from '../../lib/cognito';
import { APIGatewayProxyHandler } from 'aws-lambda';
import User, { DynamoFormat } from '../../lib/model/user';

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.pathParameters) {
    return badRequest('PathParameters missing');
  }
  if (!event.body) {
    return badRequest('Body missing');
  }

  let requestBody;
  try {
    requestBody = JSON.parse(event.body);
  } catch (err) {
    return badRequest(err.name + ' ' + err.message);
  }

  let user = new User(
    requestBody.email,
    requestBody.name,
    requestBody.family_name,
    requestBody.address
  );

  const result = await Cognito.updateUser(
    user.toDynamoFormat(),
    event.pathParameters.username
  ).catch((err) => {
    //handle error of dynamoDB
    console.log(err);
    return null;
  });

  if (!result) {
    return badResponse('Failed to udpate user');
  }

  return response({ data: { message: 'User updated correctly' } });
};
