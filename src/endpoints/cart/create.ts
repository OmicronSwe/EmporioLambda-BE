import { response, badRequest, badResponse } from '../../lib/APIResponses';
import Dynamo from '../../services/dynamo/dynamo';
import { APIGatewayProxyHandler } from 'aws-lambda';
import tableName from '../../services/dynamo/tableName';
import Cart from '../../model/cart/cart';
import Product from '../../model/product/product';
import { CartDB } from '../../model/cart/interface';
import { ProductDB } from '../../model/product/interface';

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return badRequest('Body missing');
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
    //handle logic error of cart
    return badRequest(err.name + ' ' + err.message);
  }
  //get info of product

  //check if products exist and are modify
  for (const productCart of body.products) {
    const result: ProductDB = await Dynamo.get(tableName.product, 'id', productCart.id).catch(
      (err) => {
        //handle error of dynamoDB
        console.log(err);
        return null;
      }
    );

    if (!result) {
      return badResponse('Failed to get product');
    }

    if (Object.keys(result).length !== 0) {
      const prod: Product = new Product(result);

      cart.addProduct(prod, productCart.quantity);
    }
  }

  const data = cart.toJSON();

  //push data to dynamodb

  const newCart = await Dynamo.write(tableName.cart, data).catch((err) => {
    //handle error of dynamoDB
    console.log(err);
    return null;
  });

  if (!newCart) {
    return badResponse('Failed to save cart');
  }

  return response({ data: { message: 'Cart saved' } });
};
