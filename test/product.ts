'use strict';

import { APIGatewayProxyEvent } from 'aws-lambda';

// tests for product

//config for dynamoDB local
let AWS = require('aws-sdk');
AWS.config.update({
  region: 'local',
  accessKeyId: 'xxxx',
  secretAccessKey: 'xxxx',
  endpoint: 'http://localhost:8000',
});

//test for populated table
describe('Product populated table', () => {
  const data: APIGatewayProxyEvent = {
    body: '{"name": "test", "description": "test_description"}',
    pathParameters: {
      name: 'test',
    },
  };

  const mochaPlugin = require('serverless-mocha-plugin');
  const expect = mochaPlugin.chai.expect;

  //functions of product
  const create = mochaPlugin.getWrapper('create', '/src/endpoints/product/create.ts', 'index');

  before((done) => {
    done();
  });

  it('product create function - should be "Product "test" created correctly"', async () => {
    const response = await create.run(data);
    expect(JSON.parse(response.body).message).to.be.equal('Product "test" created correctly');
  });
});
