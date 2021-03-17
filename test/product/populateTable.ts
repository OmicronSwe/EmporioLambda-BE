/*'use strict';

import { APIGatewayProxyEvent } from 'aws-lambda';

import '../localDynamoDb';

//test for populate table
describe('Product populate table', () => {
  

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
      const data: APIGatewayProxyEvent = {
        body:
          '{"name": "test", "description": "test_description", "price": 10, "category": ["elettric","house"]}',
      };
  
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
  
  
    it('product delete function - should be "PathParameters missing"', async () => {
      const dataQuery: APIGatewayProxyEvent = {
        dummy: {
          id: 45,
        },
      };
  
      const response = await deleteFun.run(dataQuery);
      expect(JSON.parse(response.statusCode)).to.be.equal(400);
      expect(JSON.parse(response.body).error).to.be.equal('PathParameters missing');
    });
  
    it('product delete function - should be "Failed to delete product"', async () => {
      const dataQuery: APIGatewayProxyEvent = {
        pathParameters: {
          dummy: 45,
        },
      };
  
      const response = await deleteFun.run(dataQuery);
      expect(JSON.parse(response.statusCode)).to.be.equal(502);
      expect(JSON.parse(response.body).error).to.be.equal('Failed to delete product');
    });
  });*/
