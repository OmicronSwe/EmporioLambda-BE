import { APIGatewayProxyHandler } from "aws-lambda";
import { response, badRequest, badResponse } from "../../lib/APIResponses";
import Dynamo from "../../services/dynamo/dynamo";

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
    taxesApplied: (await Dynamo.get(process.env.TAX_TABLE, "name", "IVA")).rate,
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
        process.env.PRODUCT_TABLE,
        "id",
        body.products[i].id
      );

      if (Object.keys(result).length !== 0) {
        const productDb: ProductDB = {
          id: result.id,
          name: result.name,
          description: result.description,
          imageUrl: result.imageUrl,
          price: result.price,
          category: result.category,
        };

        const prod: Product = new Product(productDb);

        cart.addProduct(prod, body.products[i].quantity);
      }
    } catch (error) {
      return badResponse("Failed to get product");
    }
  }

  const data = cart.toJSON();

  // push data to dynamodb

  try {
    await Dynamo.write(process.env.CART_TABLE, data);
    return response({ data: { message: "Cart saved" } });
  } catch (error) {
    return badResponse("Failed to save cart");
  }
};
