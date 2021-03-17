/*'use strict';

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
  const list = mochaPlugin.getWrapper('list', '/src/endpoints/product/list.ts', 'index');
  const query = mochaPlugin.getWrapper('query', '/src/endpoints/product/query.ts', 'index');
  const get = mochaPlugin.getWrapper('get', '/src/endpoints/product/getById.ts', 'index');

  before((done) => {
    done();
  });

  it('product list function - should be "Products not found"', async () => {
    const response = await list.run();
    expect(JSON.parse(response.statusCode)).to.be.equal(404);
    expect(JSON.parse(response.body).error).to.be.equal('Products not found');
  });

  it('product query function - should be "Body missing"', async () => {
    const data: APIGatewayProxyEvent = {
      dummy: '{"name": "test", "condition": "getByName"}',
      pathParameters: {
        id: 'test',
      },
    };

    const response = await query.run(data);
    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal('Body missing');
  });

  it('product query function - should be "Condition not supported"', async () => {
    const data: APIGatewayProxyEvent = {
      body: '{"name": "test", "condition": "getByDescription"}',
      pathParameters: {
        id: 'test',
      },
    };

    const response = await query.run(data);
    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal('Condition not supported');
  });

  it('product query function - should be "Products not found"', async () => {
    const response = await query.run(data);
    expect(JSON.parse(response.statusCode)).to.be.equal(404);
    expect(JSON.parse(response.body).error).to.be.equal('Products not found');
  });

  it('product get function - should be "Product not found"', async () => {
    const response = await get.run(data);
    expect(JSON.parse(response.statusCode)).to.be.equal(404);
    expect(JSON.parse(response.body).error).to.be.equal('Product not found');
  });

  it('product get function - should be "PathParameters missing"', async () => {
    const data={
      dummy: {
        id: 'test',
      }
    };

    const response = await get.run(data);
    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal('PathParameters missing');
  });

  it('product get function - should be "Failed to get product"', async () => {
    const data={
      pathParameters: {
        dummy: 'test',
      }
    };

    const response = await get.run(data);
    expect(JSON.parse(response.statusCode)).to.be.equal(502);
    expect(JSON.parse(response.body).error).to.be.equal('Failed to get product');
  });
});*/
