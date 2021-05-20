import { APIGatewayProxyHandler } from "aws-lambda";
import { response, badRequest, badResponse } from "../../lib/APIResponses";
import Cart from "../../model/cart/cart";
import { TaxUpdateRequest } from "../../model/tax/interface";
import Dynamo from "../../services/dynamo/dynamo";

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return badRequest("Body missing");
  }

  if (!event.pathParameters) {
    return badRequest("PathParameters missing");
  }

  const body = JSON.parse(event.body);

  const taxUpdate: TaxUpdateRequest = {
    rate: body.rate,
  };

  try {
    const resultGet = await Dynamo.get(
      process.env.TAX_TABLE,
      "name",
      event.pathParameters.name
    );

    if (Object.keys(resultGet).length === 0) {
      return badRequest("Tax not exist");
    }
  } catch (error) {
    return badResponse("Failed to check if tax exist");
  }

  // Update price in cart after update taxes

  const cartList = await Dynamo.scan(process.env.CART_TABLE);

  let cartFromDB: Cart;
  for (let i = 0; i < cartList.items.length; i++) {
    cartList.items[i].taxesApplied = taxUpdate.rate;
    cartFromDB = new Cart(cartList.items[i]);
    await Dynamo.write(process.env.CART_TABLE, cartFromDB.toJSON());
  }

  try {
    await Dynamo.update(
      process.env.TAX_TABLE,
      "name",
      event.pathParameters.name,
      Object.keys(taxUpdate),
      Object.values(taxUpdate)
    );
    return response({
      data: { message: `Tax update correctly` },
    });
  } catch (error) {
    return badResponse("Failed to update tax");
  }
};
