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

export const badRequest = (error: string) => response({ data: { error }, statusCode: 400 });

export const badResponse = (error: string) => response({ data: { error }, statusCode: 502 });

export const notFound = (error: string) => response({ data: { error }, statusCode: 404 });
