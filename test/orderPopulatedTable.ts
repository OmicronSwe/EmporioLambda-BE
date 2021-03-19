'use strict';

import { APIGatewayProxyEvent } from 'aws-lambda';

import './localDynamoDb';

//test for populated table
describe('Order populated table', () => {
  const mochaPlugin = require('serverless-mocha-plugin');
  const expect = mochaPlugin.chai.expect;

  //functions of product
  const list = mochaPlugin.getWrapper('index', '/src/endpoints/order/list.ts', 'index');
  const getById = mochaPlugin.getWrapper('index', '/src/endpoints/order/getById.ts', 'index');
  const getByEmail = mochaPlugin.getWrapper('index', '/src/endpoints/order/getByEmail.ts', 'index');
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

    //console.log(response);

    const body = JSON.parse(response.body);

    expect(JSON.parse(response.statusCode)).to.be.equal(200);

    expect(body.result.items.length).to.be.equal(3);

    let checkPrice: number = 0;
    let checkEmail: number = 0;

    body.result.items.forEach((element) => {
      if (element.totalPrice == 100 || element.totalPrice == 230 || element.totalPrice == 25.78) {
        checkPrice++;
      }

      if (element.email == 'test2@test.com' || element.email == 'test@test.com') {
        checkEmail++;
      }
    });

    expect(checkPrice).to.be.equal(3);
    expect(checkEmail).to.be.equal(3);
  });

  it('order getByEmail function - should return item "test2@test.com"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        email: 'test2@test.com',
      },
    };

    const response = await getByEmail.run(data);
    const body = JSON.parse(response.body);

    expect(JSON.parse(response.statusCode)).to.be.equal(200);

    expect(body.result.items[0].email).to.be.equal('test2@test.com');
    expect(body.result.items[0].totalPrice).to.be.equal(25.78);

    expect(body.result.items[0].products[0].id).to.be.equal('dummy_id_14');
    expect(body.result.items[0].products[0].name).to.be.equal('name product 14');
    expect(body.result.items[0].products[0].description).to.be.equal('description product 14');
    expect(body.result.items[0].products[0].price).to.be.equal(12.89);
    expect(body.result.items[0].products[0].quantity).to.be.equal(2);
    expect(body.result.items[0].products[0].category).to.be.empty;
    expect(body.result.items[0].products[0].image).to.be.null;
  });

  it('order getById function - should return item "test2@test.com"', async () => {
    //get id
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        email: 'test2@test.com',
      },
    };

    const responseByEmail = await getByEmail.run(data);
    //console.log(response);

    const id = JSON.parse(responseByEmail.body).result.items[0].id;

    const data2: APIGatewayProxyEvent = {
      pathParameters: {
        id: id,
      },
    };

    const response = await getById.run(data2);
    const body = JSON.parse(response.body);

    expect(JSON.parse(response.statusCode)).to.be.equal(200);

    expect(body.result.email).to.be.equal('test2@test.com');
    expect(body.result.totalPrice).to.be.equal(25.78);

    expect(body.result.products[0].id).to.be.equal('dummy_id_14');
    expect(body.result.products[0].name).to.be.equal('name product 14');
    expect(body.result.products[0].description).to.be.equal('description product 14');
    expect(body.result.products[0].price).to.be.equal(12.89);
    expect(body.result.products[0].quantity).to.be.equal(2);
    expect(body.result.products[0].category).to.be.empty;
    expect(body.result.products[0].image).to.be.null;
  });
});
