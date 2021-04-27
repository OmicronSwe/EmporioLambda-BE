import { ProductDB } from "../src/model/product/interface";
import Product from "../src/model/product/product";

const mochaPlugin = require("serverless-mocha-plugin");
const mockery = require("mockery");
const nodemailerMock = require("nodemailer-mock");

mockery.enable({
  warnOnUnregistered: false,
});

mockery.registerMock("nodemailer", nodemailerMock);

//import must be after mockery settings
import Nodemailer from "../src/services/nodemailer/nodemailer";

describe("Nodemailer test send email", () => {
  const expect = mochaPlugin.chai.expect;

  // data to send
  const productDB: ProductDB = {
    name: "testProduct",
    description: "testProductDescription",
    price: 10,
    category: null,
  };
  const prod = new Product(productDB);

  const products = new Map<Product, number>([[prod, 1]]);

  afterEach(async () => {
    nodemailerMock.mock.reset();
  });

  after(async () => {
    mockery.deregisterAll();
    mockery.disable();
  });

  it("Should send an email using nodemailer-mock", async () => {
    // call a service that uses nodemailer
    const resp = await Nodemailer.sendEmailProduct(
      products,
      "test@test.com",
      20,
      "testCostumerName"
    );
    expect(resp).equal(true);

    const sentEmails = nodemailerMock.mock.getSentMail();
    expect(sentEmails.length).equal(1);
    expect(sentEmails[0].to).equal("test@test.com");
    expect(sentEmails[0].subject).equal("Order details");
  });

  it("Should fail to send an email using nodemailer-mock", async () => {
    // tell the mock class to return an error
    nodemailerMock.mock.setShouldFailOnce();

    // call a service that uses nodemailer
    const resp = await Nodemailer.sendEmailProduct(
      products,
      "test@test.com",
      20,
      "testCostumerName"
    );
    expect(resp).equal(false);
  });
});
