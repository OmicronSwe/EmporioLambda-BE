'use strict';

import { APIGatewayProxyEvent } from 'aws-lambda';

import '../localDynamoDb';

//test for empty table
describe('Product empty table', () => {
  const data: APIGatewayProxyEvent = {
    body: '{"name": "test", "condition": "getByName"}',
    pathParameters: {
      id: 'test',
    },
  };

  const mochaPlugin = require('serverless-mocha-plugin');
  const expect = mochaPlugin.chai.expect;

  //functions of product
  const list = mochaPlugin.getWrapper('index', '/src/endpoints/product/list.ts', 'index');
  const search = mochaPlugin.getWrapper('index', '/src/endpoints/product/search.ts', 'index');
  const get = mochaPlugin.getWrapper('index', '/src/endpoints/product/getById.ts', 'index');

  before((done) => {
    done();
  });

  it('product list function - should be "Products not found"', async () => {
    const response = await list.run();

    expect(JSON.parse(response.statusCode)).to.be.equal(404);
    expect(JSON.parse(response.body).error).to.be.equal('Products not found');
  });

  it('product search function - should be "PathParameters missing"', async () => {
    const data: APIGatewayProxyEvent = {
      dummy: {
        id: 'test',
      },
    };

    const response = await search.run(data);
    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal('PathParameters missing');
  });

  it('product search function - should be "Bad search path form"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        search: 'dummy',
      },
    };

    //console.log(data);
    const response = await search.run(data);

    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal('Bad search path form');
  });

  it('product search function - should be "Products not found"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        search: 'category=dummy',
      },
    };

    const response = await search.run(data);

    expect(JSON.parse(response.statusCode)).to.be.equal(404);
    expect(JSON.parse(response.body).error).to.be.equal('Products not found');
  });

  it('product get function - should be "Product not found"', async () => {
    const response = await get.run(data);
    expect(JSON.parse(response.statusCode)).to.be.equal(404);
    expect(JSON.parse(response.body).error).to.be.equal('Product not found');
  });

  it('product get function - should be "PathParameters missing"', async () => {
    const data = {
      dummy: {
        id: 'test',
      },
    };

    const response = await get.run(data);
    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal('PathParameters missing');
  });

  it('product get function - should be "Failed to get product"', async () => {
    const data = {
      pathParameters: {
        dummy: 'test',
      },
    };

    const response = await get.run(data);
    expect(JSON.parse(response.statusCode)).to.be.equal(502);
    expect(JSON.parse(response.body).error).to.be.equal('Failed to get product');
  });
});
