'use strict';

import { APIGatewayProxyEvent } from 'aws-lambda';

import '../localDynamoDb';

//test for populated table
describe('Order populated table', () => {
  const mochaPlugin = require('serverless-mocha-plugin');
  const expect = mochaPlugin.chai.expect;

  //functions of product
  const list = mochaPlugin.getWrapper('index', '/src/endpoints/order/list.ts', 'index');
  /*const search = mochaPlugin.getWrapper('index', '/src/endpoints/product/search.ts', 'index');
  const get = mochaPlugin.getWrapper('index', '/src/endpoints/product/getById.ts', 'index');*/
  const create = mochaPlugin.getWrapper('index', '/src/endpoints/order/create.ts', 'index');

  before(async () => {
    const data: APIGatewayProxyEvent = {
      body:
        '{"email": "test@test.com", "products": [{"id": "dummy_id_9","description": "description product 1" ,"name": "name product 1", "price" : 10, "quantity": 2},{"id": "dummy_id_10", "name": "name product 2", "price" : 20, "quantity": 4, "description": "description product 2"}]}',
    };

    const data2: APIGatewayProxyEvent = {
      body:
        '{"email": "test@test.com", "products": [{"id": "dummy_id_12","description": "description product 10" ,"name": "name product 10", "price" : 30, "quantity": 1},{"id": "dummy_id_13", "name": "name product 11", "price" : 40, "quantity": 5, "description": "description product 11"}]}',
    };

    const data3: APIGatewayProxyEvent = {
        body:
          '{"email": "test2@test.com", "products": [{"id": "dummy_id_14","description": "description product 14" ,"name": "name product 14", "price" : 12.89, "quantity": 2}]}',
    };

    await create.run(data);
    await create.run(data2);
    await create.run(data3);
  });


  it('order list function - should contains 3 orders (2 of "test@test.com" and 1 of "test2@test.com")', async () => {
    const response = await list.run();

    console.log(response);

    const body = JSON.parse(response.body);

    expect(JSON.parse(response.statusCode)).to.be.equal(200);

    expect(body.result.items.length).to.be.equal(3);


    /*expect(body.result.items.should.include.something.that.deep.equals

    expect(body.result.items[index_test].name).to.be.equal('test');
    expect(body.result.items[index_test].description).to.be.equal('test_description');
    expect(body.result.items[index_test].price).to.be.equal(10);
    expect(body.result.items[index_test].category[0]).to.be.equal('electric');
    expect(body.result.items[index_test].category[1]).to.be.equal('house');
    expect(body.result.items[index_test].image).to.be.null;

    expect(body.result.items[index_test2].name).to.be.equal('test 2');
    expect(body.result.items[index_test2].description).to.be.equal('test_description2');
    expect(body.result.items[index_test2].price).to.be.equal(20);
    expect(body.result.items[index_test2].category[0]).to.be.equal('garden');
    expect(body.result.items[index_test2].image).to.be.null;*/
  });


  /*it('order get function - should return item "test"', async () => {
    //get id
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        search: encodeURIComponent('category=electric'),
      },
    };

    const responseSearch = await list.run(data);
    const id = JSON.parse(responseSearch.body).result.items[0].id;

    const dataSearch: APIGatewayProxyEvent = {
      pathParameters: {
        id: id,
      },
    };

    const response = await get.run(dataSearch);
    const body = JSON.parse(response.body);
    //console.log(response);
    expect(JSON.parse(response.statusCode)).to.be.equal(200);

    expect(body.result.name).to.be.equal('test');
    expect(body.result.description).to.be.equal('test_description');
    expect(body.result.price).to.be.equal(10);
    expect(body.result.category[0]).to.be.equal('electric');
    expect(body.result.category[1]).to.be.equal('house');
    expect(body.result.image).to.be.null;
  });*/

 
});