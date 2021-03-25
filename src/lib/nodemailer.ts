/*const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS_EMAIL,
  },
});

const Nodemailer = {
  sendEmailProduct: async (
    productList: Array<object>,
    totalPrice: number,
    name_customer: string
  ) => {
    // setup e-mail data with unicode symbols
    var mailOptions = {
      from: '"EmporioLambda company" <' + process.env.EMAIL + '>', // sender address
      to: order.email, // list of receivers
      subject: 'Order details', // Subject line
      text: text, // plaintext body
      html: html, // html body
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

    if (resp) {
      return response({ data: { message: 'Order receive' } });
    } else {
      return badResponse('Failed to send email of order');
    }
  },
};*/
