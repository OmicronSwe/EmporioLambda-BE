'use strict';

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
  const deleteFun = mochaPlugin.getWrapper('index', '/src/endpoints/product/delete.ts', 'index');*/ it('order create function - should be "Order receive"', async () => {
    const data: APIGatewayProxyEvent = {
      body:
        '{"email": "test3@test.com", "products": [{"id": "dummy_id_9","description": "description product 1" ,"name": "name product 1", "price" : 11, "quantity": 2},{"id": "dummy_id_10", "name": "name product 2", "price" : 20, "quantity": 4, "description": "description product 2"}]}',
    };

    const response = await create.run(data);

    //console.log(response);
    expect(JSON.parse(response.statusCode)).to.be.equal(200);
    expect(JSON.parse(response.body).message).to.be.equal('Order receive');
  });
});
