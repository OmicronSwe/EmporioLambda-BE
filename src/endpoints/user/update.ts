import { APIGatewayProxyHandler } from "aws-lambda";
import { response, badResponse, badRequest } from "../../lib/APIResponses";
import Cognito from "../../services/cognito/cognito";
import User from "../../model/user/user";
import { UserCognito } from "../../model/user/interface";

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

  let requestBody: UserCognito;
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

  try {
    await Cognito.updateUser(
      user.toCognitoFormat(),
      event.pathParameters.username
    );

    return response({ data: { message: "User updated correctly" } });
  } catch (error) {
    if (error.message.includes("AliasExistsException")) {
      return badResponse("New email already in use");
    }
    return badResponse("Failed to udpate user");
  }
};
