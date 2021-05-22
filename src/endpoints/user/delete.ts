import { APIGatewayProxyHandler } from "aws-lambda";
import { response, badResponse, badRequest } from "../../lib/APIResponses";
import User from "../../model/user/user";
import Cognito from "../../services/cognito/cognito";
import Dynamo from "../../services/dynamo/dynamo";
import Stripe from "../../services/stripe/stripe";

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.pathParameters) {
    return badRequest("PathParameters missing");
  }

  let result;

  try {
    await Dynamo.delete(
      process.env.CART_TABLE,
      "username",
      event.pathParameters.username
    );
  } catch (error) {
    return badResponse("Failed to delete the cart of user");
  }

  try {
    result = await Dynamo.query(
      process.env.ORDER_TABLE,
      "username_date_index",
      ["username"],
      [event.pathParameters.username],
      "#element0 = :Value0"
    );
  } catch (error) {
    return badResponse("Failed to get orders in order to set null");
  }

  // set null username on order of user
  for (let i = 0; i < result.items.length; i++) {
    try {
      await Dynamo.removeAttribute(
        process.env.ORDER_TABLE,
        "id",
        result.items[i].id,
        ["username"]
      );
    } catch (error) {
      return badResponse("Failed to remove username in order");
    }
  }

  // delete user
  try {
    const result = await Cognito.getUserAttributes(
      event.pathParameters.username
    );

    const user = User.fromCognitoFormat(result);

    // delete user on stripe
    const customerIDStripe: string = await Stripe.getCustomerByEmail(
      user.getEmail()
    );

    await Stripe.deleteCustomer(customerIDStripe);

    // delete user on cognito
    await Cognito.deleteUser(event.pathParameters.username);
    return response({ data: { message: "User deleted correctly" } });
  } catch (error) {
    return badResponse("Failed to delete user");
  }
};
