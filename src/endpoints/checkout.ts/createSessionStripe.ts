import { response, badRequest, badResponse, notFound } from '../../lib/APIResponses';
import Dynamo from '../../lib/dynamo';
import { APIGatewayProxyHandler } from 'aws-lambda';
import tableName from '../../lib/tableName';
import Order from '../../lib/model/order';
import Cart from '../../lib/model/cart';
import Product from '../../lib/model/product';
import Stripe from '../../lib/stripe';

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return badRequest('Body missing');
  }

  const body = JSON.parse(event.body);

  let result = await Dynamo.get(tableName.cart, 'username', body.username).catch((err) => {
    //handle error of dynamoDB
    console.log(err);
    return null;
  });

  if (!result) {
    return badResponse('Failed to get cart');
  }

  if (Object.keys(result).length === 0) {
    return notFound('Cart not found');
  }

  let cart: Cart = new Cart(result);

  //check if products exist and are modify
  for (const productCart of cart.getProducts()) {
    const result = await Dynamo.get(tableName.product, 'id', productCart.id).catch((err) => {
      //handle error of dynamoDB
      console.log(err);
      return null;
    });

    if (!result) {
      return badResponse('Failed to get product');
    }

    if (Object.keys(result).length === 0) {
      return notFound(
        'Some products are no longer available, please check your shopping cart before proceeding'
      );
    } else {
      const prodFromDb = new Product(result);

      if (productCart.isDifference(prodFromDb)) {
        return badResponse(
          'Some products have changed, please check your shopping cart before proceeding'
        );
      }
    }
  }

  //create stripe session
  try {
    const sessionStripeId = await Stripe.createSession(cart, body.successurl, body.cancelurl);

    return response({ data: { sessionid: sessionStripeId } });
  } catch (err) {
    //handle error of stripe
    console.log(err);
    return badResponse('Enable to create sessione of Stripe');
  }
};
