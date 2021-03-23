import { response, notFound, badResponse, badRequest } from '../../lib/APIResponses';
import Cognito from '../../lib/cognito';
import { APIGatewayProxyHandler } from 'aws-lambda';

interface Request {
  UserAttributes: [
    {
      Name: string;
      Value: string;
    }
  ];
  AccessToken: string;
}

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return badRequest('Body missing');
  }
  let requestBody: Request;
  try {
    requestBody = JSON.parse(event.body);
  } catch (err) {
    return badRequest(err.name + ' ' + err.message);
  }

  const username = await Cognito.getUsername(requestBody.AccessToken).catch((err) => {
    //handle error of dynamoDB
    console.log(err);
    return null;
  });

  if (!username) {
    return badResponse('Failed get user info');
  }

  const result = await Cognito.updateUser(requestBody.UserAttributes, username).catch((err) => {
    //handle error of dynamoDB
    console.log(err);
    return null;
  });

  if (!result) {
    return badResponse('Failed to udpate user');
  }

  return response({ data: { message: 'User updated correctly' } });
};
