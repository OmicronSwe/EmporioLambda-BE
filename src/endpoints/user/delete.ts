import { APIGatewayProxyHandler } from "aws-lambda";
import { response, badResponse, badRequest } from "../../lib/APIResponses";
import Cognito from "../../services/cognito/cognito";
import Dynamo from "../../services/dynamo/dynamo";
import tableName from "../../services/dynamo/tableName";

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.pathParameters) {
    return badRequest("PathParameters missing");
  }

  // delete cart item
  const deleteCartUsername = Dynamo.delete(
    tableName.cart,
    "username",
    event.pathParameters.username
  ).catch(() => {
    // handle error of dynamoDB
    return null;
  });

  if (!deleteCartUsername) {
    return badResponse("Failed to delete the cart of user");
  }

  // get order user
  const result = await Dynamo.query(
    tableName.order,
    "username_date_index",
    ["username"],
    [event.pathParameters.username],
    "#element0 = :Value0"
  ).catch(() => {
    // handle error of dynamoDB
    return null;
  });

  if (!result) {
    return badResponse("Failed to get orders in order to set null");
  }

  // set null username on order of user
  for (let i = 0; i < result.items.length; i++) {
    const OrderUsernameToNull = await Dynamo.update(
      tableName.order,
      "id",
      result.items[i].id,
      ["username"],
      [null]
    ).catch(() => {
      // handle dynamoDb error
      return null;
    });

    if (!OrderUsernameToNull) {
      return badResponse("Failed to set null order of user");
    }
  }

  // delete user on cognito
  return Cognito.deleteUser(event.pathParameters.username)
    .then(() => {
      return response({ data: { message: "User deleted correctly" } });
    })
    .catch(() => {
      // handle error of dynamoDB
      return badResponse("Failed to delete user");
    });
};
