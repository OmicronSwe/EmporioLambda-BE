import { response, notFound, badResponse, badRequest } from '../../lib/APIResponses';
import Cognito from '../../lib/cognito';
import { APIGatewayProxyHandler } from 'aws-lambda';

export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return badRequest('Body missing');
  }

  try {
    const params: string = JSON.parse(event.body).accessToken;
    console.log(params);

    const result = await Cognito.getUserAttributes(params).catch((err) => {
      //handle error of dynamoDB
      console.log(err);
      return null;
    });

    if (!result) {
      return badResponse('Failed to get user data');
    }

    return response({ data: { result } });
  } catch (err) {
    return badRequest(err.name + ' ' + err.message);
  }
};
