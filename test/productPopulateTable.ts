'use strict';

import { APIGatewayProxyEvent } from 'aws-lambda';

import './localDynamoDb';

//test for populate table
describe('Product populate table', () => {
  const mochaPlugin = require('serverless-mocha-plugin');
  const expect = mochaPlugin.chai.expect;

  //functions of product
  const create = mochaPlugin.getWrapper('index', '/src/endpoints/product/create.ts', 'index');
  const update = mochaPlugin.getWrapper('index', '/src/endpoints/product/update.ts', 'index');
  const search = mochaPlugin.getWrapper('index', '/src/endpoints/product/search.ts', 'index');
  const getById = mochaPlugin.getWrapper('index', '/src/endpoints/product/getById.ts', 'index');
  const deleteFun = mochaPlugin.getWrapper('index', '/src/endpoints/product/delete.ts', 'index');

  before(async () => {
    const createCategory = mochaPlugin.getWrapper(
      'index',
      '/src/endpoints/category/create.ts',
      'index'
    );

    const dataCategory1: APIGatewayProxyEvent = {
      body: '{"name": "electric"}',
    };

    const dataCategory2: APIGatewayProxyEvent = {
      body: '{"name": "house"}',
    };

    await createCategory.run(dataCategory1);
    await createCategory.run(dataCategory2);
  });

  it('product create function - should be "Product "test" created correctly"', async () => {
    const data: APIGatewayProxyEvent = {
      body:
        '{"name": "test", "description": "test_description", "price": 10, "category": "electric"}',
    };

    const response = await create.run(data);
    expect(JSON.parse(response.statusCode)).to.be.equal(200);
    expect(JSON.parse(response.body).message).to.be.equal('Product "test" created correctly');
  });

  it('product create function - should be "Category not exist"', async () => {
    const data: APIGatewayProxyEvent = {
      body:
        '{"name": "test", "description": "test_description", "price": 10, "category": "domotic"}',
    };

    const response = await create.run(data);
    expect(JSON.parse(response.statusCode)).to.be.equal(404);
    expect(JSON.parse(response.body).error).to.be.equal('Category not exist');
  });

  it('product create function - should be "Error mime or image not found" with image', async () => {
    const data: APIGatewayProxyEvent = {
      body:
        '{"name": "test", "description": "test_description", "price": 10, "category": "electric", "image": {"mime":"image/png"}}',
    };

    const response = await create.run(data);
    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal('Error mime or image not found');
  });

  it('product create function - should be "Error mime is not allowed" with image', async () => {
    const data: APIGatewayProxyEvent = {
      body:
        '{"name": "test", "description": "test_description", "price": 10, "category": "electric", "image": {"mime":"image/gif", "imageCode":"base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="}}',
    };

    const response = await create.run(data);
    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal('Error mime is not allowed');
  });

  it('product create function - should be "Error mime types don\'t match" with image', async () => {
    const data: APIGatewayProxyEvent = {
      body:
        '{"name": "test", "description": "test_description", "price": 10, "category": "electric", "image": {"mime":"image/jpg", "imageCode":"base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="}}',
    };

    const response = await create.run(data);
    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal("Error mime types don't match");
  });

  it('product create function - should be "Failed to create product"', async () => {
    const errorData: APIGatewayProxyEvent = {
      body: '{"name": 1, "description": 2}',
    };

    const response = await create.run(errorData);
    expect(JSON.parse(response.statusCode)).to.be.equal(502);
    expect(JSON.parse(response.body).error).to.be.equal('Failed to create product');
  });

  it('product create function - should be "Body missing"', async () => {
    const errorData: APIGatewayProxyEvent = {
      dummy: '{"name": 1, "description": 2}',
    };

    const response = await create.run(errorData);
    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal('Body missing');
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
      pathParameters: {
        search: encodeURIComponent('category=electric&maxprice=200'),
      },
    };

    const responseSearch = await search.run(data2);

    //console.log(responseSearch);
    const id = JSON.parse(responseSearch.body).result.items[0].id;

    const dataSearch: APIGatewayProxyEvent = {
      body:
        '{"name": "test_update", "description": "test_description_update", "price": 20, "category": "garden"}',
      pathParameters: {
        id: id,
      },
    };

    const response = await update.run(dataSearch);
    expect(JSON.parse(response.body).message).to.be.equal('Product updated correctly');

    //check if item is updated in db
    const responseAfterUpdate = await getById.run(dataSearch);
    const body = JSON.parse(responseAfterUpdate.body);

    console.log(body.result);
    expect(JSON.parse(responseAfterUpdate.statusCode)).to.be.equal(200);
    expect(body.result.name).to.be.equal('test_update');
    expect(body.result.description).to.be.equal('test_description_update');
    expect(body.result.price).to.be.equal(20);
    expect(body.result.category).to.be.equal('garden');
    expect(body.result.imageUrl).to.be.null;
  });

  it('product update function - should be "Body missing"', async () => {
    const errorData: APIGatewayProxyEvent = {
      dummy: '{"name": 1, "description": 2}',
      pathParameters: {
        name: 'dummy',
      },
    };

    const response = await update.run(errorData);
    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal('Body missing');
  });

  it('product update function - should be "PathParameters missing"', async () => {
    const errorData: APIGatewayProxyEvent = {
      body: '{"name": 1, "description": 2}',
    };

    const response = await update.run(errorData);
    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal('PathParameters missing');
  });

  it('product update function - should be "Product not found"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        id: 'dummy',
      },
    };

    const response = await deleteFun.run(data);
    expect(JSON.parse(response.statusCode)).to.be.equal(404);
    expect(JSON.parse(response.body).error).to.be.equal('Product not found');
  });

  it('product delete function - should be "Product deleted correctly"', async () => {
    //get id
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        search: encodeURIComponent('name=test_update'),
      },
    };

    const responseSearch = await search.run(data);
    const id = JSON.parse(responseSearch.body).result.items[0].id;

    const dataSearch: APIGatewayProxyEvent = {
      pathParameters: {
        id: id,
      },
    };

    const response = await deleteFun.run(dataSearch);
    expect(JSON.parse(response.statusCode)).to.be.equal(200);
    expect(JSON.parse(response.body).message).to.be.equal('Product deleted correctly');

    //check if item is deleted in db
    const responseAfterUpdate = await getById.run(dataSearch);
    expect(JSON.parse(responseAfterUpdate.statusCode)).to.be.equal(404);
    expect(JSON.parse(responseAfterUpdate.body).error).to.be.equal('Product not found');
  });

  it('product delete function - should be "PathParameters missing"', async () => {
    const data: APIGatewayProxyEvent = {
      dummy: {
        id: 45,
      },
    };

    const response = await deleteFun.run(data);
    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal('PathParameters missing');
  });

  it('product delete function - should be "Product not found"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        id: 'dummy',
      },
    };

    const response = await deleteFun.run(data);
    expect(JSON.parse(response.statusCode)).to.be.equal(404);
    expect(JSON.parse(response.body).error).to.be.equal('Product not found');
  });

  after(async () => {
    //functions
    const deleteCategory = mochaPlugin.getWrapper(
      'index',
      '/src/endpoints/category/delete.ts',
      'index'
    );

    //data
    const dataCategory1: APIGatewayProxyEvent = {
      pathParameters: {
        name: 'electric',
      },
    };

    const dataCategory2: APIGatewayProxyEvent = {
      pathParameters: {
        name: 'house',
      },
    };

    //delete category
    await deleteCategory.run(dataCategory1);
    await deleteCategory.run(dataCategory2);
  });
});
