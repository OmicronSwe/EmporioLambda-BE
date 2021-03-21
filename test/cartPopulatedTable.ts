/*'use strict';

import { APIGatewayProxyEvent } from 'aws-lambda';

import './localDynamoDb';

//test for populate table
describe('Cart populate table', () => {
  const mochaPlugin = require('serverless-mocha-plugin');
  const expect = mochaPlugin.chai.expect;

  //functions of order
  
  const getByEmail = mochaPlugin.getWrapper('index', '/src/endpoints/cart/getByEmail.ts', 'index');

  before(async () => {

    const createProd = mochaPlugin.getWrapper('index', '/src/endpoints/product/create.ts', 'index');

    const data: APIGatewayProxyEvent = {
      body:
        '{"id": "dummy_id_9","description": "description product 1" ,"name": "name product 1", "price" : 11}',
    };
    const data2: APIGatewayProxyEvent = {
      body:
        '{"id": "dummy_id_10", "name": "name product 2 new", "price" : 21,"description": "description product 2"}',
    };

    //await createProd.run(data);
    await createProd.run(data2);

    const createCart = mochaPlugin.getWrapper('index', '/src/endpoints/cart/create.ts', 'index');

    const dataCart: APIGatewayProxyEvent = {
        body:
          '{"email": "test3@test.com", "products": [{"id": "dummy_id_9", "quantity": 2},{"id": "dummy_id_10" ,"quantity": 4}]}',
      };
  
    await createCart.run(dataCart);
  });

  it('cart getByEmail function - should be return cart "test3@test.com"', async() =>{
    const data: APIGatewayProxyEvent = {
        pathParameters: {
            email: 'test3@test.com',
        },
    };
  
    const response = await getByEmail.run(data);

    //console.log(response);
    expect(JSON.parse(response.statusCode)).to.be.equal(200);
    //expect(JSON.parse(response.body).message).to.be.equal('Cart saved');

  });


});*/
