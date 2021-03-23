import { response, notFound, badResponse, badRequest } from '../../lib/APIResponses';
import Cognito from '../../lib/cognito';
import { APIGatewayProxyHandler } from 'aws-lambda';

export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.pathParameters) {
    return badRequest('PathParameters missing');
  }

  const result = await Cognito.getUserAttributes(event.pathParameters.username).catch((err) => {
    //handle error of dynamoDB
    console.log(err);
    return null;
  });

  if (!result) {
    return badResponse('Failed to get user data');
  }

  return response({ data: { result } });
};
