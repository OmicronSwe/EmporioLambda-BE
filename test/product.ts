'use strict';

import { APIGatewayProxyEvent } from 'aws-lambda';

import './localDynamoDb';

//test for populated table
describe('Product populated table', () => {
  const data: APIGatewayProxyEvent = {
    body: '{"name": "test", "description": "test_description", "price": 10}',
    pathParameters: {
      name: 'test',
    },
  };

  const updateData =
    '{"name": "test_update", "description": "test_description_update", "price": 10}';

  const mochaPlugin = require('serverless-mocha-plugin');
  const expect = mochaPlugin.chai.expect;

  //functions of product
  const create = mochaPlugin.getWrapper('create', '/src/endpoints/product/create.ts', 'index');
  const update = mochaPlugin.getWrapper('update', '/src/endpoints/product/update.ts', 'index');
  const query = mochaPlugin.getWrapper('query', '/src/endpoints/product/query.ts', 'index');
  const list = mochaPlugin.getWrapper('list', '/src/endpoints/product/list.ts', 'index');

  before((done) => {
    done();
  });

  it('product create function - should be "Product "test" created correctly"', async () => {
    const response = await create.run(data);
    expect(JSON.parse(response.body).message).to.be.equal('Product "test" created correctly');
  });

  it('product list function - should contains only item "test"', async () => {
    const response = await list.run();
    expect(JSON.parse(response.body).result.length).to.be.equal(1);
    expect(JSON.parse(response.body).result[0].name).to.be.equal('test');
    expect(JSON.parse(response.body).result[0].description).to.be.equal('test_description');
  });

  it('product update function - should be modify item "test"', async () => {
    //get id
    const data2: APIGatewayProxyEvent = {
      body: '{"name": "test", "condition": "getByName"}',
      pathParameters: {
        name: 'test',
      },
    };
    const responseQuery = await query.run(data2);

    console.log(responseQuery);
    const id = JSON.parse(responseQuery.body).result[0].id;

    const dataQuery: APIGatewayProxyEvent = {
      body: updateData,
      pathParameters: {
        id: id,
      },
    };

    const response = await update.run(dataQuery);
    expect(JSON.parse(response.body).message).to.be.equal('Product updated correctly');

    /*//check if item is updated in db
    const responseAfterUpdate = await get.run(dataQuery);
    expect(JSON.parse(responseAfterUpdate.body).name).to.be.equal('test_populate_update');
    expect(JSON.parse(responseAfterUpdate.body).description).to.be.equal(
      'test_populate_description_update'
    );*/
  });
});
