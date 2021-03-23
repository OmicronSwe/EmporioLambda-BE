import { response, badRequest, badResponse } from '../../lib/APIResponses';
import { APIGatewayProxyHandler } from 'aws-lambda';

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  const params = {
    name: 'gino',
    totalPrice: 20,
    products: [
      {
        image:
          'https://local-imagebucket.s3.eu-central-1.amazonaws.com/c0654e0a-db95-46ad-a6ed-4d811aa01802.png',
        quantity: 2,
        price: 10,
        name: 'name product 1',
        description: 'description product 1',
        id: 'dummy_id_9',
        category: null,
      },
      {
        image: null,
        quantity: 3,
        price: 20,
        name: 'name product 2',
        description: 'description product 2',
        id: 'dummy_id_20',
        category: null,
      },
    ],
  };

  let html: string =
    `<h1>Hi ` +
    params.name +
    `,</h1><h2>this is your order</h2><br>
  <table style="text-align: center;width: 80%;border-spacing: 0 1em;">
    <tr>
      <th></th>
      <th>Product</th>
      <th>Price</th>
      <th>Quantity</th>
    </tr>`;
  let text: string = 'Hi ' + params.name + ', this is your order:\n\n';

  params.products.forEach((element) => {
    html +=
      `<tr><td width="30%"><img width="100%" src="` +
      element.image +
      `" alt="` +
      element.name +
      `" /></td>
    <td><p>` +
      element.name +
      `</p></td>
    <td><p>` +
      element.price +
      ` EUR</p></td>
    <td><p>` +
      element.quantity +
      `</p></td></tr>`;

    text +=
      '- Product: ' +
      element.name +
      ' | Price: ' +
      element.price +
      ' EUR | Quantity: ' +
      element.quantity +
      '\n';
  });
  html += '</table><br><h2>Total price: ' + params.totalPrice + ' EUR</h2>';
  text += '\nTotal price: ' + params.totalPrice + ' EUR';

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
    from: '"EmporioLambda company" <omicronswe@gmail.com>', // sender address
    to: 'nicomanto49@gmail.com', // list of receivers
    subject: 'Order', // Subject line
    text: text, // plaintext body
    html: html, // html body
  };

  // send mail with defined transport object
  return await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return badResponse('Failed to send email');
    } else {
      return response({ data: { message: 'Email send' } });
    }
  });
};
