import { APIGatewayProxyResult } from "aws-lambda";

/** good response
 * @param  {} {statusCode=200 :code of the response (optional)
 * @param  {} data={}: data of the responde (optional)
 * @param  {} cors=true} if is used cors (optional)
 * @returns APIGatewayProxyResult
 */
export const response = ({ statusCode = 200, data = {}, cors = true }) => {
  const response: APIGatewayProxyResult = {
    statusCode,
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (cors) {
    response.headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    };
  }

  return response;
};

/** bad request from front-end (error 400)
 * @param  {string} error: error for bad response
 */
export const badRequest = (error: string) =>
  response({ data: { error }, statusCode: 400 });

/** bad response from back-end (internal problem back-end)
 * @param  {string} error: error for bad response
 */
export const badResponse = (error: string) =>
  response({ data: { error }, statusCode: 502 });

/** element not found (error 404)
 * @param  {string} error: error for bad response
 */
export const notFound = (error: string) =>
  response({ data: { error }, statusCode: 404 });
