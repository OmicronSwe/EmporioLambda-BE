import { APIGatewayProxyHandler } from "aws-lambda";
import { response, badResponse, badRequest } from "../../lib/APIResponses";
import Cognito from "../../services/cognito/cognito";
import User from "../../model/user/user";
import { DynamoFormat } from "../../model/user/interface";

export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.pathParameters) {
    return badRequest("PathParameters missing");
  }

  const result: DynamoFormat[] = await Cognito.getUserAttributes(
    event.pathParameters.username
  ).catch(() => {
    // handle error of dynamoDB
    return null;
  });

  if (!result) {
    return badResponse("Failed to get user data");
  }

  const user = User.fromDynamoFormat(result);

  return response({ data: { result: user.getData() } });
};
