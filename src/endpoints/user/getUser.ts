import { response, notFound, badResponse, badRequest } from '../../lib/APIResponses';
import Cognito from '../../services/cognito/cognito';
import { APIGatewayProxyHandler } from 'aws-lambda';
import User, { DynamoFormat } from '../../lib/model/user';

export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.pathParameters) {
    return badRequest('PathParameters missing');
  }

  const result: DynamoFormat[] = await Cognito.getUserAttributes(
    event.pathParameters.username
  ).catch((err) => {
    //handle error of dynamoDB
    console.log(err);
    return null;
  });

  if (!result) {
    return badResponse('Failed to get user data');
  }

  let user = User.fromDynamoFormat(result);

  return response({ data: { result: user.getData() } });
};
