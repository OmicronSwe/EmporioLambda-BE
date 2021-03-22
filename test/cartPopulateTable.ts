'use strict';

import { APIGatewayProxyEvent } from 'aws-lambda';

import './localDynamoDb';

//test for populate table
describe('Cart populate table', () => {
  const mochaPlugin = require('serverless-mocha-plugin');
  const expect = mochaPlugin.chai.expect;

  //functions of order
  const create = mochaPlugin.getWrapper('index', '/src/endpoints/cart/create.ts', 'index');
  const addProduct = mochaPlugin.getWrapper('index', '/src/endpoints/cart/addProduct.ts', 'index');
  const getByEmail = mochaPlugin.getWrapper('index', '/src/endpoints/cart/getByEmail.ts', 'index');
  const deleteFun = mochaPlugin.getWrapper('index', '/src/endpoints/cart/delete.ts', 'index');

  before(async () => {
    const createProd = mochaPlugin.getWrapper('index', '/src/endpoints/product/create.ts', 'index');

    const dataProduct1: APIGatewayProxyEvent = {
      body:
        '{"id": "dummy_id_9","description": "description product 1" ,"name": "name product 1", "price" : 11}',
    };
    const dataProduct2: APIGatewayProxyEvent = {
      body:
        '{"id": "dummy_id_10", "name": "name product 2", "price" : 21,"description": "description product 2"}',
    };

    await createProd.run(dataProduct1);
    await createProd.run(dataProduct2);
  });

  it('cart create function - should be "Cart saved"', async () => {
    const data: APIGatewayProxyEvent = {
      body:
        '{"email": "test3@test.com", "products": [{"id": "dummy_id_9","quantity": 2},{"id": "dummy_id_10","quantity": 4}]}',
    };

    const response = await create.run(data);

    //console.log(response);
    expect(JSON.parse(response.statusCode)).to.be.equal(200);
    expect(JSON.parse(response.body).message).to.be.equal('Cart saved');
  });

  it('cart addProduct function - should be add item to "test3@test.com"', async () => {
    const data: APIGatewayProxyEvent = {
      body: '{"id": "dummy_id_10", "quantity": 2}',
      pathParameters: {
        email: 'test3@test.com',
      },
    };

    const response = await addProduct.run(data);

    //console.log(response);
    expect(JSON.parse(response.body).message).to.be.equal('Product "name product 2" added to cart');
  });

  it('cart addProduct function - should be "Body missing"', async () => {
    const errorData: APIGatewayProxyEvent = {
      dummy: '{"name": 1, "description": 2}',
      pathParameters: {
        name: 'dummy',
      },
    };

    const response = await addProduct.run(errorData);
    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal('Body missing');
  });

  it('cart addProduct function - should be "PathParameters missing"', async () => {
    const errorData: APIGatewayProxyEvent = {
      body: '{"id": "dummy_id_9", quantity": 2}',
    };

    const response = await addProduct.run(errorData);
    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal('PathParameters missing');
  });

  it('cart removeProduct function - should be remove item "dummy_id_10" from "test3@test.com"', async () => {
    const data: APIGatewayProxyEvent = {
      body: '{"id": "dummy_id_10", "quantity": 2}',
      pathParameters: {
        email: 'test3@test.com',
      },
    };

    const response = await addProduct.run(data);

    const data2: APIGatewayProxyEvent = {
      pathParameters: {
        email: 'test3@test.com',
      },
    };

    const response2 = await getByEmail.run(data2);

    //console.log(response2);
    expect(JSON.parse(response.body).message).to.be.equal('Product "name product 2" added to cart');
  });

  it('cart removeProduct function - should be "Body missing"', async () => {
    const errorData: APIGatewayProxyEvent = {
      dummy: '{"name": 1, "description": 2}',
      pathParameters: {
        name: 'dummy',
      },
    };

    const response = await addProduct.run(errorData);
    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal('Body missing');
  });

  it('cart removeProduct function - should be "PathParameters missing"', async () => {
    const errorData: APIGatewayProxyEvent = {
      body: '{"id": "dummy_id_9", quantity": 2}',
    };

    const response = await addProduct.run(errorData);
    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal('PathParameters missing');
  });

  it('cart delete function - should be "Cart deleted"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        email: 'test3@test.com',
      },
    };

    const response = await deleteFun.run(data);
    expect(JSON.parse(response.statusCode)).to.be.equal(200);
    expect(JSON.parse(response.body).message).to.be.equal('Cart deleted');
  });

  it('cart delete function - should be "PathParameters missing"', async () => {
    const data: APIGatewayProxyEvent = {
      dummy: {
        id: 45,
      },
    };

    const response = await deleteFun.run(data);
    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal('PathParameters missing');
  });

  it('cart delete function - should be "Failed to delete the cart"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        id: 'dummy',
      },
    };

    const response = await deleteFun.run(data);
    expect(JSON.parse(response.statusCode)).to.be.equal(502);
    expect(JSON.parse(response.body).error).to.be.equal('Failed to delete the cart');
  });

  after(async () => {
    //functions
    const deleteProduct = mochaPlugin.getWrapper(
      'index',
      '/src/endpoints/product/delete.ts',
      'index'
    );

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

    //delete product
    await deleteProduct.run(dataProduct1);
    await deleteProduct.run(dataProduct2);
  });
});
