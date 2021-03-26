import { response, notFound, badResponse, badRequest } from '../../lib/APIResponses';
import Dynamo from '../../services/dynamo/dynamo';
import { APIGatewayProxyHandler } from 'aws-lambda';
import tableName from '../../services/dynamo/tableName';
import Cart from '../../lib/model/cart';
import Product from '../../lib/model/product';

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.pathParameters) {
    return badRequest('PathParameters missing');
  }

  let result = await Dynamo.get(tableName.cart, 'username', event.pathParameters.username).catch(
    (err) => {
      //handle error of dynamoDB
      console.log(err);
      return null;
    }
  );

  if (!result) {
    return badResponse('Failed to get cart');
  }

  if (Object.keys(result).length === 0) {
    return notFound('Cart not found');
  }

  let change: boolean = false;
  let messageChange: Array<string> = new Array<string>();

  let cart: Cart = new Cart(result);

  //check if products exist and are modify
  for (const productCart of cart.getProductsList()) {
    const result = await Dynamo.get(tableName.product, 'id', productCart.id).catch((err) => {
      //handle error of dynamoDB
      console.log(err);
      return null;
    });

    if (!result) {
      return badResponse('Failed to get product');
    }

    if (Object.keys(result).length === 0) {
      change = true;
      messageChange.push('Product "' + productCart.name + '" no longer available');
      cart.removeProductTotally(productCart);
    } else {
      //console.log(result);
      const prodFromDb = new Product(result);

      if (productCart.isDifference(prodFromDb)) {
        cart.updateProduct(productCart, prodFromDb);
        change = true;
        messageChange.push('"' + productCart.name + '" product has been modified');
      }
    }
  }

  if (change) {
    result = cart.toJSON();
    result.change = {
      products: messageChange,
    };
  }

  //console.log(result);

  return response({ data: { result } });
};
