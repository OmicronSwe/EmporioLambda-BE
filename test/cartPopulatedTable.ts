'use strict';

import { APIGatewayProxyEvent } from 'aws-lambda';

import './localDynamoDb';

//test for populate table
describe('Cart populated table', () => {
  const mochaPlugin = require('serverless-mocha-plugin');
  const expect = mochaPlugin.chai.expect;

  //functions of caart
  const getByEmail = mochaPlugin.getWrapper('index', '/src/endpoints/cart/getByEmail.ts', 'index');

  before(async () => {
    //functions
    const createProd = mochaPlugin.getWrapper('index', '/src/endpoints/product/create.ts', 'index');
    const createCart = mochaPlugin.getWrapper('index', '/src/endpoints/cart/create.ts', 'index');

    //data
    const dataProduct1: APIGatewayProxyEvent = {
      body:
        '{"id": "dummy_id_9","description": "description product 1" ,"name": "name product 1", "price" : 11}',
    };

    const dataProduct2: APIGatewayProxyEvent = {
      body:
        '{"id": "dummy_id_10", "name": "name product 2 new", "price" : 21,"description": "description product 2"}',
    };

    const dataCart: APIGatewayProxyEvent = {
      body:
        '{"email": "test3@test.com", "products": [{"id": "dummy_id_9", "quantity": 2},{"id": "dummy_id_10" ,"quantity": 4}]}',
    };

    //create product
    await createProd.run(dataProduct1);
    await createProd.run(dataProduct2);

    //create cart
    await createCart.run(dataCart);

    //delete product after create cart
    const deleteProduct = mochaPlugin.getWrapper(
      'index',
      '/src/endpoints/product/delete.ts',
      'index'
    );

    const dataProductDelete2: APIGatewayProxyEvent = {
      pathParameters: {
        id: 'dummy_id_10',
      },
    };

    await deleteProduct.run(dataProductDelete2);
  });

  it('cart getByEmail function - should be return cart "test3@test.com" without producy "name product new 2"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        email: 'test3@test.com',
      },
    };

    const response = await getByEmail.run(data);

    const body = JSON.parse(response.body);

    expect(JSON.parse(response.statusCode)).to.be.equal(200);
    expect(body.result.totalPrice).to.be.equal(22);
    expect(body.result.email).to.be.equal('test3@test.com');
    //manage taxes TO-DO
    expect(body.result.taxesApplied).to.be.equal(0);
    expect(body.result.products.length).to.be.equal(1);
    expect(body.result.products[0].id).to.be.equal('dummy_id_9');
    expect(body.result.products[0].name).to.be.equal('name product 1');
    expect(body.result.products[0].description).to.be.equal('description product 1');
    expect(body.result.products[0].price).to.be.equal(11);
    expect(body.result.products[0].quantity).to.be.equal(2);
    expect(body.result.products[0].image).to.be.null;
    expect(body.result.products[0].category).to.be.null;
    expect(body.result.change.products[0]).to.be.equal(
      'Product "name product 2 new" no longer available'
    );
  });

  it('cart getByEmail function - should be "PathParameters missing"', async () => {
    const errorData: APIGatewayProxyEvent = {
      body: '{"id": "dummy_id_9", "quantity": 2}',
    };

    const response = await getByEmail.run(errorData);
    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal('PathParameters missing');
  });

  it('cart getByEmail function - should be "Failed to get cart"', async () => {
    const errorData: APIGatewayProxyEvent = {
      pathParameters: {
        name: 'dummy',
      },
    };

    const response = await getByEmail.run(errorData);
    expect(JSON.parse(response.statusCode)).to.be.equal(502);
    expect(JSON.parse(response.body).error).to.be.equal('Failed to get cart');
  });

  it('cart getByEmail function - should be "Cart not found"', async () => {
    const errorData: APIGatewayProxyEvent = {
      pathParameters: {
        email: 'dummy@test.com',
      },
    };

    const response = await getByEmail.run(errorData);
    expect(JSON.parse(response.statusCode)).to.be.equal(404);
    expect(JSON.parse(response.body).error).to.be.equal('Cart not found');
  });

  after(async () => {
    //functions
    const deleteProduct = mochaPlugin.getWrapper(
      'index',
      '/src/endpoints/product/delete.ts',
      'index'
    );
    const deleteCart = mochaPlugin.getWrapper('index', '/src/endpoints/cart/delete.ts', 'index');

    const dataProduct1: APIGatewayProxyEvent = {
      pathParameters: {
        id: 'dummy_id_9',
      },
    };

    const dataCart: APIGatewayProxyEvent = {
      pathParameters: {
        email: 'test3@test.com',
      },
    };

    //delete product
    await deleteProduct.run(dataProduct1);

    //delete cart
    await deleteCart.run(dataCart);
  });
});
