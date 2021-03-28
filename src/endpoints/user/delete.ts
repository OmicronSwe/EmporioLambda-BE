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

  return Cognito.deleteUser(event.pathParameters.username)
    .then(() => {
      return response({ data: { message: "User deleted correctly" } });
    })
    .catch(() => {
      // handle error of dynamoDB
      return badResponse("Failed to delete user");
    });
};
