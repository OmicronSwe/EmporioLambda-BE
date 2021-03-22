'use strict';

import { APIGatewayProxyEvent } from 'aws-lambda';

import './localDynamoDb';

//test for populate table
describe('Cart populate table', () => {
  const mochaPlugin = require('serverless-mocha-plugin');
  const expect = mochaPlugin.chai.expect;

  //functions of order

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
  });

  it('cart getByEmail function - should be return cart "test3@test.com"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        email: 'test3@test.com',
      },
    };

    const response = await getByEmail.run(data);

    //console.log(response);
    expect(JSON.parse(response.statusCode)).to.be.equal(200);
    //expect(JSON.parse(response.body).message).to.be.equal('Cart saved');
  });

  after(async () => {
    //functions
    const deleteProduct = mochaPlugin.getWrapper(
      'index',
      '/src/endpoints/product/delete.ts',
      'index'
    );
    const deleteCart = mochaPlugin.getWrapper('index', '/src/endpoints/cart/delete.ts', 'index');

    //data
    const dataProduct1: APIGatewayProxyEvent = {
      pathParameters: {
        id: 'dummy_id_9',
      },
    };

    const dataProduct2: APIGatewayProxyEvent = {
      pathParameters: {
        id: 'dummy_id_10',
      },
    };

    const dataCart: APIGatewayProxyEvent = {
      pathParameters: {
        email: 'test3@test.com',
      },
    };

    //delete product
    await deleteProduct.run(dataProduct1);
    await deleteProduct.run(dataProduct2);

    //delete cart
    const response = await deleteCart.run(dataCart);
  });
});
