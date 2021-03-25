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
    let dataSessionStripe;
    try {
      dataSessionStripe = await Stripe.retrieveDataCheckout(webhookStripe.id);
    } catch (error) {
      return badResponse('Failed to get session from stripe');
    }

    let result = await Dynamo.get(tableName.cart, 'username', dataSessionStripe.costumer).catch(
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
    let order: Order = new Order(cart, dataSessionStripe.customer_email);

    //push data to dynamodb
    try {
      const data = order.toJSON();

      const newOrder = await Dynamo.write(tableName.order, data).catch((err) => {
        //handle error of dynamoDB
        console.log(err);
        return null;
      });

      if (!newOrder) {
        return badResponse('Failed to receive order');
      }
    } catch (err) {
      //handle logic error of order
      return badRequest(err.name + ' ' + err.message);
    }

    //empty the cart
    const data = {
      username: cart.username,
      products: [],
    };

    const resultCartEmpty = await Dynamo.write(tableName.cart, data).catch((err) => {
      //handle error of dynamoDB
      console.log(err);
      return null;
    });

    if (!result) {
      return badResponse('Failed to empty the cart');
    }

    //send email;

    var nodemailer = require('nodemailer');

    // create reusable transporter object using the default SMTP transport
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS_EMAIL,
      },
    });

    // setup e-mail data with unicode symbols
    var mailOptions = {
      from: '"EmporioLambda company" <' + process.env.EMAIL + '>', // sender address
      to: order.email, // list of receivers
      subject: 'Order details', // Subject line
      text: text, // plaintext body
      html: html, // html body
    };

    // send mail with defined transport object
    let resp = await new Promise((resolve) => {
      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.log(error);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });

    if (resp) {
      return response({ data: { message: 'Order receive' } });
    } else {
      return badResponse('Failed to send email of order');
    }
  } else {
    return badResponse('Failed to create order');
  }
};
