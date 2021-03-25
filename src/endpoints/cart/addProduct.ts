import { response, badRequest, badResponse, notFound } from '../../lib/APIResponses';
import Dynamo from '../../lib/dynamo';
import { APIGatewayProxyHandler } from 'aws-lambda';
import tableName from '../../lib/tableName';
import Cart from '../../lib/model/cart';
import Product from '../../lib/model/product';

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return badRequest('Body missing');
  }

  if (!event.pathParameters) {
    return badRequest('PathParameters missing');
  }

  const body = JSON.parse(event.body);

  //get Informations cart
  const resultGetCart = await Dynamo.get(
    tableName.cart,
    'username',
    event.pathParameters.username
  ).catch((err) => {
    //handle error of dynamoDB
    console.log(err);
    return null;
  });

  if (!resultGetCart) {
    return badResponse('Failed to get cart');
  }

  if (Object.keys(resultGetCart).length === 0) {
    resultGetCart.username = event.pathParameters.username;
  }

  //get info from product id
  const resultGetProduct = await Dynamo.get(tableName.product, 'id', body.id).catch((err) => {
    //handle error of dynamoDB
    console.log(err);
    return null;
  });

  if (!resultGetProduct) {
    return badResponse('Failed to get product');
  }

  if (Object.keys(resultGetProduct).length === 0) {
    return notFound('Product not found');
  }

  const prod: Product = new Product(resultGetProduct);

  const cartFromDB: Cart = new Cart(resultGetCart);

  cartFromDB.addProduct(prod, body.quantity ? body.quantity : 1);

  const newCart = await Dynamo.write(tableName.cart, cartFromDB.getData()).catch((err) => {
    //handle error of dynamoDB
    console.log(err);
    return null;
  });

  if (!newCart) {
    return badResponse('Failed to add product "' + prod.name + '" to cart');
  }

  return response({ data: { message: 'Product "' + prod.name + '" added to cart' } });
};
