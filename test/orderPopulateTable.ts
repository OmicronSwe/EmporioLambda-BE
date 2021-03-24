/*'use strict';

import { APIGatewayProxyEvent } from 'aws-lambda';

import './localDynamoDb';

//test for populate table
describe('Order populate table', () => {
  const mochaPlugin = require('serverless-mocha-plugin');
  const expect = mochaPlugin.chai.expect;

  //functions of order
  const create = mochaPlugin.getWrapper('index', '/src/endpoints/order/create.ts', 'index');
  /*const update = mochaPlugin.getWrapper('index', '/src/endpoints/product/update.ts', 'index');
  const search = mochaPlugin.getWrapper('index', '/src/endpoints/product/search.ts', 'index');
  const get = mochaPlugin.getWrapper('index', '/src/endpoints/product/getById.ts', 'index');
  const deleteFun = mochaPlugin.getWrapper('index', '/src/endpoints/product/delete.ts', 'index');

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
        '{"username": "username-string", "products": [{"id": "dummy_id_9", "quantity": 2},{"id": "dummy_id_10" ,"quantity": 4}]}',
    };

    //create product
    await createProd.run(dataProduct1);
    await createProd.run(dataProduct2);

    //create cart
    await createCart.run(dataCart);

    //delete product after create cart
    /*const deleteProduct = mochaPlugin.getWrapper(
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


  it('order create function - should be "Order receive"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        username: 'username-string',
      },
    };

    const response = await create.run(data);

    console.log(response);
    expect(JSON.parse(response.statusCode)).to.be.equal(200);
    expect(JSON.parse(response.body).message).to.be.equal('Order receive');
  });


  it('order create function - should be "Some products are no longer available, please check your shopping cart before proceeding"', async () => {
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

    const data: APIGatewayProxyEvent = {
      pathParameters: {
        username: 'username-string',
      },
    };

    const response = await create.run(data);

    console.log(response);
    expect(JSON.parse(response.statusCode)).to.be.equal(404);
    expect(JSON.parse(response.body).error).to.be.equal('Some products are no longer available, please check your shopping cart before proceeding');
  });

  it('order create function - should be "Some products have changed, please check your shopping cart before proceeding"', async () => {
    //update product
    const updateProduct = mochaPlugin.getWrapper(
      'index',
      '/src/endpoints/product/update.ts',
      'index'
    );

    const dataProduct: APIGatewayProxyEvent = {
      body:
        '{"name": "test_update", "description": "test_description_update", "price": 20, "category": "garden"}',
      pathParameters: {
        id: 'dummy_id_9',
      },
    };

    await updateProduct.run(dataProduct);

    const data: APIGatewayProxyEvent = {
      pathParameters: {
        username: 'username-string',
      },
    };

    const response = await create.run(data);

    console.log(response);
    expect(JSON.parse(response.statusCode)).to.be.equal(502);
    expect(JSON.parse(response.body).error).to.be.equal('Some products have changed, please check your shopping cart before proceeding');
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
});*/
