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
  //console.log(event);
  if (!event.body) {
    return badRequest('Body missing');
  }

  const webhookStripe = JSON.parse(event.body).data.object;

  if (webhookStripe.payment_status == 'paid') {
    try {
      const data = await Stripe.retrieveDataCheckout(webhookStripe.id);
      console.log(data);
    } catch (error) {
      return badResponse('Failed to save order');
    }
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

  //push data to dynamodb
  try {
    let order: Order = new Order(cart, 'dummy');
    const data = order.getData();

    const newOrder = await Dynamo.write(tableName.order, data).catch((err) => {
      //handle error of dynamoDB
      console.log(err);
      return null;
    });

    if (!newOrder) {
      return badResponse('Failed to receive order');
    }

    return response({ data: { message: 'Order receive' } });
  } catch (err) {
    //handle logic error of order
    return badRequest(err.name + ' ' + err.message);
  }
};
