import { APIGatewayProxyResult } from 'aws-lambda';

export const response = ({ statusCode = 200, data = {}, cors = true }): APIGatewayProxyResult => {
  const response: APIGatewayProxyResult = {
    statusCode,
    body: JSON.stringify(data),
  };

  if (cors) {
    response.headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    };
  }

  return response;
};

export const badRequest = (message: string) => response({ data: { message }, statusCode: 400 });
