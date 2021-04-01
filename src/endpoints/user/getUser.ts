import { APIGatewayProxyHandler } from "aws-lambda";
import { response, badResponse, badRequest } from "../../lib/APIResponses";
import Cognito from "../../services/cognito/cognito";
import User from "../../model/user/user";
import { CognitoFormat } from "../../model/user/interface";

export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.pathParameters) {
    return badRequest("PathParameters missing");
  }

  try {
    const result = await Cognito.getUserAttributes(
      event.pathParameters.username
    );

    const user = User.fromCognitoFormat(result);

    return response({ data: { result: user.toJSON() } });
  } catch (error) {
    return badResponse("Failed to get user data");
  }
};
