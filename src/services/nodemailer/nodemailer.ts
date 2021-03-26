import Product from '../../lib/model/product';
import { HMTLTemplate, TXTTemplate } from './orderTemplateEmail';

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS_EMAIL,
  },
});

const Nodemailer = {
  sendEmailProduct: async (
    productList: Map<Product, number>,
    emailToSend: string,
    totalPrice: number,
    nameCustomer: string
  ) => {
    // setup e-mail data with unicode symbols

    var mailOptions = {
      from: '"EmporioLambda company" <' + process.env.EMAIL + '>', // sender address
      to: emailToSend, // list of receivers
      subject: 'Order details', // Subject line
      text: TXTTemplate(productList, totalPrice, nameCustomer), // plaintext body
      html: HMTLTemplate(productList, totalPrice, nameCustomer), // html body
    };
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

    if (!resp) {
      throw Error('Failed to send email of order');
    }
  },
};

export default Nodemailer;
