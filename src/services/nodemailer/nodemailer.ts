import Product from "../../model/product/product";
import { HMTLTemplate, TXTTemplate } from "./orderTemplateEmail";

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS_EMAIL,
  },
});

const Nodemailer = {
  sendEmailProduct: (
    productList: Map<Product, number>,
    emailToSend: string,
    totalPrice: number,
    nameCustomer: string
  ): Promise<boolean> => {
    // setup e-mail data with unicode symbols

    const mailOptions = {
      from: `"EmporioLambda company" <${process.env.EMAIL}>`, // sender address
      to: emailToSend, // list of receivers
      subject: "Order details", // Subject line
      text: TXTTemplate(productList, totalPrice, nameCustomer), // plaintext body
      html: HMTLTemplate(productList, totalPrice, nameCustomer), // html body
    };

    return new Promise((resolve) => {
      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  },
};

export default Nodemailer;
