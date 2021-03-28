import { APIGatewayProxyHandler } from "aws-lambda";
import {
  response,
  notFound,
  badResponse,
  badRequest,
} from "../../lib/APIResponses";
import Cognito from "../../services/cognito/cognito";
import User, { DynamoFormat } from "../../model/user";

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

  let requestBody;
  try {
    requestBody = JSON.parse(event.body);
  } catch (err) {
    return badRequest(`${err.name} ${err.message}`);
  }

  const user = new User(
    requestBody.email,
    requestBody.name,
    requestBody.family_name,
    requestBody.address,
    requestBody.username
  );

  const result = await Cognito.updateUser(
    user.toDynamoFormat(),
    event.pathParameters.username
  ).catch((err) => {
    // handle error of dynamoDB
    console.log(err);
    return null;
  });

  if (!result) {
    return badResponse("Failed to udpate user");
  }

  return response({ data: { message: "User updated correctly" } });
};
