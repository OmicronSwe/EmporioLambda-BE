import { response, badRequest, badResponse, notFound } from '../../lib/APIResponses';
import Dynamo from '../../services/dynamo/dynamo';
import { APIGatewayProxyHandler } from 'aws-lambda';
import tableName from '../../services/dynamo/tableName';
import Order from '../../model/order/order';
import Cart from '../../model/cart/cart';
import Product from '../../model/product/product';
import Stripe from '../../services/stripe/stripe';
import { CartDB } from '../../model/cart/interface';
import { ProductDB } from '../../model/product/interface';

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return badRequest('Body missing');
  }

  const body = JSON.parse(event.body);

  let result: CartDB = await Dynamo.get(tableName.cart, 'username', body.username).catch((err) => {
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
  for (const productCart of cart.getProductsList()) {
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

    return response({ data: { sessionId: sessionStripeId } });
  } catch (err) {
    //handle error of stripe
    console.log(err);
    return badResponse('Enable to create sessione of Stripe');
  }
};
