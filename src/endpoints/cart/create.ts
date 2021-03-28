import { APIGatewayProxyHandler } from "aws-lambda";
import { response, badRequest, badResponse } from "../../lib/APIResponses";
import Dynamo from "../../services/dynamo/dynamo";
import tableName from "../../services/dynamo/tableName";
import Cart from "../../model/cart/cart";
import Product from "../../model/product/product";
import { CartDB } from "../../model/cart/interface";
import { ProductDB } from "../../model/product/interface";

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return badRequest("Body missing");
  }

  const body: CartDB = JSON.parse(event.body);

  const dataCart: CartDB = {
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
    const result: ProductDB = await Dynamo.get(
      tableName.product,
      "id",
      body.products[i].id
    ).catch(() => {
      // handle error of dynamoDB
      // console.log(err);
      return null;
    });

    if (!result) {
      return badResponse("Failed to get product");
    }

    if (Object.keys(result).length !== 0) {
      const prod: Product = new Product(result);

      cart.addProduct(prod, body.products[i].quantity);
    }
  }

  const data = cart.toJSON();

  // push data to dynamodb

  return await Dynamo.write(tableName.cart, data)
    .then(() => {
      return response({ data: { message: "Cart saved" } });
    })
    .catch(() => {
      return badResponse("Failed to save cart");
    });
};
