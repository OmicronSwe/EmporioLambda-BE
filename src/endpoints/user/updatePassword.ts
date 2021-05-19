import { APIGatewayProxyHandler } from "aws-lambda";
import { response, badResponse, badRequest } from "../../lib/APIResponses";
import Cognito from "../../services/cognito/cognito";

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.pathParameters) {
    return badRequest("PathParameters missing");
  }
  if (!event.body) {
    return badRequest("Body missing");
  }

  let requestPassword: string;
  try {
    requestPassword = JSON.parse(event.body).password;
  } catch (err) {
    return badRequest(`${err.name} ${err.message}`);
  }

  try {
    await Cognito.updateUserPassword(
      requestPassword,
      event.pathParameters.username
    );

    return response({ data: { message: "Password updated correctly" } });
  } catch (error) {
    return badResponse("Failed to udpate password");
  }
};
