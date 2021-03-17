'use strict';

import { APIGatewayProxyEvent } from 'aws-lambda';

import '../localDynamoDb';

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
  //const query = mochaPlugin.getWrapper('index', '/src/endpoints/product/query.ts', 'index');
  const search = mochaPlugin.getWrapper('index', '/src/endpoints/product/search.ts', 'index');
  const get = mochaPlugin.getWrapper('index', '/src/endpoints/product/getById.ts', 'index');
  const create = mochaPlugin.getWrapper('index', '/src/endpoints/product/create.ts', 'index');

  before(async () => {
    await create.run(data);
    await create.run(data2);
  });

  it('product list function - should contains item "test" and "test2"', async () => {
    const response = await search.run();

    const body = JSON.parse(response.body);

    expect(JSON.parse(response.statusCode)).to.be.equal(200);

    expect(body.result.length).to.be.equal(2);

    let index_test: number;
    let index_test2: number;

    if (body.result[0].name == 'test') {
      index_test = 0;
      index_test2 = 1;
    } else {
      index_test = 1;
      index_test2 = 0;
    }

    expect(body.result[index_test].name).to.be.equal('test');
    expect(body.result[index_test].description).to.be.equal('test_description');
    expect(body.result[index_test].price).to.be.equal(10);
    expect(body.result[index_test].category[0]).to.be.equal('elettric');
    expect(body.result[index_test].category[1]).to.be.equal('house');
    expect(body.result[index_test].image).to.be.null;

    expect(body.result[index_test2].name).to.be.equal('test2');
    expect(body.result[index_test2].description).to.be.equal('test_description2');
    expect(body.result[index_test2].price).to.be.equal(20);
    expect(body.result[index_test2].category[0]).to.be.equal('garden');
    expect(body.result[index_test2].image).to.be.null;
  });

  it('product query function - should contains only item "test2"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: encodeURIComponent(
        'search?name=st2&minprice=10&maxprice=20&category=garden,house'
      ),
    };

    //console.log(data);
    const response = await search.run(data);

    const body = JSON.parse(response.body);

    expect(JSON.parse(response.statusCode)).to.be.equal(200);
    expect(body.result[0].name).to.be.equal('test2');
    expect(body.result[0].description).to.be.equal('test_description2');
    expect(body.result[0].price).to.be.equal(20);
    expect(body.result[0].category[0]).to.be.equal('garden');
    expect(body.result[0].image).to.be.null;
  });

  /*it('product get function - should return item "test"', async () => {
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
  });*/
});
