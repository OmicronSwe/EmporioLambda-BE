import { APIGatewayProxyHandler } from "aws-lambda";
import { response, badResponse, badRequest } from "../../lib/APIResponses";
import Cognito from "../../services/cognito/cognito";
import User from "../../model/user/user";
import { CognitoFormat } from "../../model/user/interface";

export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.pathParameters) {
    return badRequest("PathParameters missing");
  }

  const result: CognitoFormat[] = await Cognito.getUserAttributes(
    event.pathParameters.username
  ).catch(() => {
    // handle error of dynamoDB
    return null;
  });

  if (!result) {
    return badResponse("Failed to get user data");
  }

  const user = User.fromCognitoFormat(result);

  return response({ data: { result: user.toJSON() } });
};
