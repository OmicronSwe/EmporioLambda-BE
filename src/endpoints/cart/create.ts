import { APIGatewayProxyHandler } from "aws-lambda";
import { response, badRequest, badResponse } from "../../lib/APIResponses";
import Dynamo from "../../services/dynamo/dynamo";
import tableName from "../../services/dynamo/tableName";
import Cart from "../../model/cart/cart";
import Product from "../../model/product/product";
import { CreateCartRequest } from "../../model/cart/interface";

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return badRequest("Body missing");
  }

  const body: CreateCartRequest = JSON.parse(event.body);

  const dataCart: CreateCartRequest = {
    username: body.username,
    products: [],
  };

  let cart: Cart;

  try {
    cart = new Cart(dataCart);
  } catch (err) {
    // handle logic error of cart
    return badRequest(`${err.name} ${err.message}`);
  }
  // get info of product

  // check if products exist and are modify
  for (let i = 0; i < body.products.length; i++) {
    try {
      const result = await Dynamo.get(
        tableName.product,
        "id",
        body.products[i].id
      );

      if (Object.keys(result).length !== 0) {
        const prod: Product = new Product(result);

        cart.addProduct(prod, body.products[i].quantity);
      }
    } catch (error) {
      return badResponse("Failed to get product");
    }
  }

  const data = cart.toJSON();

  // push data to dynamodb

  try {
    await Dynamo.write(tableName.cart, data);
    return response({ data: { message: "Cart saved" } });
  } catch (error) {
    return badResponse("Failed to save cart");
  }
};
