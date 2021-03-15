'use strict';

import { APIGatewayProxyEvent } from 'aws-lambda';

import './localDynamoDb';

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
});

//test for populate table
describe('Product populate table', () => {
  const data: APIGatewayProxyEvent = {
    body:
      '{"name": "test", "description": "test_description", "price": 10, "category": ["elettric","house"]}',
  };

  const errorData: APIGatewayProxyEvent = {
    body: '{"name": 1, "description": 2}',
    pathParameters: {
      name: 'dummy',
    },
  };

  const mochaPlugin = require('serverless-mocha-plugin');
  const expect = mochaPlugin.chai.expect;

  //functions of product
  const create = mochaPlugin.getWrapper('index', '/src/endpoints/product/create.ts', 'index');
  const update = mochaPlugin.getWrapper('index', '/src/endpoints/product/update.ts', 'index');
  const query = mochaPlugin.getWrapper('index', '/src/endpoints/product/query.ts', 'index');
  const get = mochaPlugin.getWrapper('index', '/src/endpoints/product/getById.ts', 'index');
  const deleteFun = mochaPlugin.getWrapper('index', '/src/endpoints/product/delete.ts', 'index');

  before((done) => {
    done();
  });

  it('product create function - should be "Product "test" created correctly"', async () => {
    const response = await create.run(data);
    expect(JSON.parse(response.statusCode)).to.be.equal(200);
    expect(JSON.parse(response.body).message).to.be.equal('Product "test" created correctly');
  });

  it('product create function - should be "Failed to create product"', async () => {
    const errorData: APIGatewayProxyEvent = {
      body: '{"name": 1, "description": 2}',
    };

    const response = await create.run(errorData);
    expect(JSON.parse(response.statusCode)).to.be.equal(502);
    expect(JSON.parse(response.body).error).to.be.equal('Failed to create product');
  });

  it('product create function - should be "Error name value not found"', async () => {
    const errorData: APIGatewayProxyEvent = {
      body: '{"description": "ciao", "price": 56}',
    };

    const response = await create.run(errorData);
    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal('Error name value not found');
  });

  it('product create function - should be "Error description value not found"', async () => {
    const errorData: APIGatewayProxyEvent = {
      body: '{"name": "ciao", "price": 56}',
    };

    const response = await create.run(errorData);
    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal('Error description value not found');
  });

  it('product update function - should be modify item "test"', async () => {
    //get id
    const data2: APIGatewayProxyEvent = {
      body: '{"name": "test", "condition": "getByName"}',
    };

    const responseQuery = await query.run(data2);

    //console.log(responseQuery);
    const id = JSON.parse(responseQuery.body).result[0].id;

    const dataQuery: APIGatewayProxyEvent = {
      body:
        '{"name": "test_update", "description": "test_description_update", "price": 20, "category": ["garden"]}',
      pathParameters: {
        id: id,
      },
    };

    const response = await update.run(dataQuery);
    expect(JSON.parse(response.body).message).to.be.equal('Product updated correctly');

    //check if item is updated in db
    const responseAfterUpdate = await get.run(dataQuery);
    const body = JSON.parse(responseAfterUpdate.body);

    //console.log(body.result);
    expect(JSON.parse(responseAfterUpdate.statusCode)).to.be.equal(200);
    expect(body.result.name).to.be.equal('test_update');
    expect(body.result.description).to.be.equal('test_description_update');
    expect(body.result.price).to.be.equal(20);
    expect(body.result.category[0]).to.be.equal('garden');
    expect(body.result.category[1]).to.be.undefined;
    expect(body.result.image).to.be.null;
  });

  it('product update function - should be "Failed to update product"', async () => {
    const errorData: APIGatewayProxyEvent = {
      body: '{"name": 1, "description": 2}',
      pathParameters: {
        name: 'dummy',
      },
    };

    const response = await update.run(errorData);
    expect(JSON.parse(response.statusCode)).to.be.equal(502);
    expect(JSON.parse(response.body).error).to.be.equal('Failed to update product');
  });

  it('product delete function - should be "Product deleted correctly"', async () => {
    //get id
    const data: APIGatewayProxyEvent = {
      body: '{"name": "test_update", "condition": "getByName"}',
    };

    const responseQuery = await query.run(data);
    //console.log(responseQuery);
    const id = JSON.parse(responseQuery.body).result[0].id;

    const dataQuery: APIGatewayProxyEvent = {
      pathParameters: {
        id: id,
      },
    };

    const response = await deleteFun.run(dataQuery);
    expect(JSON.parse(response.statusCode)).to.be.equal(200);
    expect(JSON.parse(response.body).message).to.be.equal('Product deleted correctly');

    //check if item is deleted in db
    const responseAfterUpdate = await get.run(dataQuery);
    expect(JSON.parse(responseAfterUpdate.statusCode)).to.be.equal(404);
    expect(JSON.parse(responseAfterUpdate.body).error).to.be.equal('Product not found');
  });
});

//test for populated table
describe('Product populated table', () => {
  const data: APIGatewayProxyEvent = {
    body:
      '{"name": "test", "description": "test_description", "price": 10, "category": ["elettric","house"]}',
  };
  const data2: APIGatewayProxyEvent = {
    body:
      '{"name": "test2", "description": "test_description2", "price": 20, "category": ["garden"]}',
  };

  const mochaPlugin = require('serverless-mocha-plugin');
  const expect = mochaPlugin.chai.expect;

  //functions of product
  const query = mochaPlugin.getWrapper('index', '/src/endpoints/product/query.ts', 'index');
  const list = mochaPlugin.getWrapper('index', '/src/endpoints/product/list.ts', 'index');
  const get = mochaPlugin.getWrapper('index', '/src/endpoints/product/getById.ts', 'index');
  const create = mochaPlugin.getWrapper('index', '/src/endpoints/product/create.ts', 'index');

  before(async () => {
    await create.run(data);
    await create.run(data2);
  });

  it('product list function - should contains item "test" and "test2"', async () => {
    const response = await list.run();

    const body = JSON.parse(response.body);
    //console.log(response);
    expect(JSON.parse(response.statusCode)).to.be.equal(200);

    expect(body.result.length).to.be.equal(2);

    expect(body.result[0].name).to.be.equal('test');
    expect(body.result[0].description).to.be.equal('test_description');
    expect(body.result[0].price).to.be.equal(10);
    expect(body.result[0].category[0]).to.be.equal('elettric');
    expect(body.result[0].category[1]).to.be.equal('house');
    expect(body.result[0].image).to.be.null;

    expect(body.result[1].name).to.be.equal('test2');
    expect(body.result[1].description).to.be.equal('test_description2');
    expect(body.result[1].price).to.be.equal(20);
    expect(body.result[1].category[0]).to.be.equal('garden');
    expect(body.result[1].image).to.be.null;
  });

  it('product query function - should contains only item "test2"', async () => {
    const data: APIGatewayProxyEvent = {
      body: '{"name": "test2", "condition": "getByName"}',
    };

    const response = await query.run(data);

    const body = JSON.parse(response.body);

    expect(JSON.parse(response.statusCode)).to.be.equal(200);
    expect(body.result[0].name).to.be.equal('test2');
    expect(body.result[0].description).to.be.equal('test_description2');
    expect(body.result[0].price).to.be.equal(20);
    expect(body.result[0].category[0]).to.be.equal('garden');
    expect(body.result[0].image).to.be.null;
  });

  it('product get function - should return item "test"', async () => {
    //get id
    const data: APIGatewayProxyEvent = {
      body: '{"name": "test", "condition": "getByName"}',
    };

    const responseQuery = await query.run(data);
    const id = JSON.parse(responseQuery.body).result[0].id;

    const dataQuery: APIGatewayProxyEvent = {
      pathParameters: {
        id: id,
      },
    };

    const response = await get.run(dataQuery);
    const body = JSON.parse(response.body);
    //console.log(response);
    expect(JSON.parse(response.statusCode)).to.be.equal(200);

    expect(body.result.name).to.be.equal('test');
    expect(body.result.description).to.be.equal('test_description');
    expect(body.result.price).to.be.equal(10);
    expect(body.result.category[0]).to.be.equal('elettric');
    expect(body.result.category[1]).to.be.equal('house');
    expect(body.result.image).to.be.null;
  });
});
