'use strict';

import { APIGatewayProxyEvent } from 'aws-lambda';

import './localDynamoDb';
import Dynamo from '../src/services/dynamo/dynamo';
import tableName from '../src/services/dynamo/tableName';
import Order from '../src/model/order/order';
import Cart from '../src/model/cart/cart';

//test for populated table
describe('Order populated table', () => {
  const mochaPlugin = require('serverless-mocha-plugin');
  const expect = mochaPlugin.chai.expect;
  let IDProduct1: string;

  //functions of product
  const list = mochaPlugin.getWrapper('index', '/src/endpoints/order/list.ts', 'index');
  const getByUsername = mochaPlugin.getWrapper(
    'index',
    '/src/endpoints/order/getByUsername.ts',
    'index'
  );
  const getById = mochaPlugin.getWrapper('index', '/src/endpoints/order/getById.ts', 'index');

  before(async () => {
    //functions
    const createProd = mochaPlugin.getWrapper('index', '/src/endpoints/product/create.ts', 'index');
    const createCart = mochaPlugin.getWrapper('index', '/src/endpoints/cart/create.ts', 'index');
    const search = mochaPlugin.getWrapper('index', '/src/endpoints/product/search.ts', 'index');

    //data
    const dataProduct1: APIGatewayProxyEvent = {
      body: '{"description": "description product 1" ,"name": "name product 1", "price" : 11}',
    };

    //create product
    await createProd.run(dataProduct1);

    //get id
    let dataId: APIGatewayProxyEvent = {
      pathParameters: {
        search: encodeURIComponent('name=name product 1'),
      },
    };

    let responseSearch = await search.run(dataId);
    IDProduct1 = JSON.parse(responseSearch.body).result.items[0].id;

    const dataCart: APIGatewayProxyEvent = {
      body:
        '{"username": "username-string-test", "products": [{"id": "' +
        IDProduct1 +
        '" ,"quantity": 4}]}',
    };

    //create cart
    await createCart.run(dataCart);

    let result = await Dynamo.get(tableName.cart, 'username', 'username-string-test').catch(
      (err) => {
        //handle error of dynamoDB
        console.log(err);
        return null;
      }
    );

    let cart: Cart;
    let order: Order;

    //push data to dynamodb
    cart = new Cart(result);
    order = new Order(cart, 'test@test.com');

    const data = order.toJSON();

    await Dynamo.write(tableName.order, data).catch((err) => {
      //handle error of dynamoDB
      console.log(err);
      return null;
    });
  });

  it('order getByUsername function - should return item "username-string-test"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        username: 'username-string-test',
      },
    };

    const response = await getByUsername.run(data);

    //console.log(response);
    const body = JSON.parse(response.body);

    expect(JSON.parse(response.statusCode)).to.be.equal(200);

    expect(body.result.items[0].email).to.be.equal('test@test.com');
    expect(body.result.items[0].totalPrice).to.be.equal(44);

    expect(body.result.items[0].products[0].id).to.be.equal(IDProduct1);
    expect(body.result.items[0].products[0].name).to.be.equal('name product 1');
    expect(body.result.items[0].products[0].description).to.be.equal('description product 1');
    expect(body.result.items[0].products[0].price).to.be.equal(11);
    expect(body.result.items[0].products[0].quantity).to.be.equal(4);
    expect(body.result.items[0].products[0].category).to.be.null;
    expect(body.result.items[0].products[0].imageUrl).to.be.null;
  });

  it('order getByUsername function - should return "PathParameters missing"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters_error: {
        username: 'username-string-test',
      },
    };

    const response = await getByUsername.run(data);

    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal('PathParameters missing');
  });

  it('order getByUsername function - should return "Orders not found"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        username: 'username-string-test_error',
      },
    };

    const response = await getByUsername.run(data);

    expect(JSON.parse(response.statusCode)).to.be.equal(404);
    expect(JSON.parse(response.body).error).to.be.equal('Orders not found');
  });

  it('order getById function - should return item "username-string-test"', async () => {
    const dataUsername: APIGatewayProxyEvent = {
      pathParameters: {
        username: 'username-string-test',
      },
    };

    const responseGetByUsername = await getByUsername.run(dataUsername);

    //console.log(responseGetByUsername);
    const bodyGetByUsername = JSON.parse(responseGetByUsername.body);

    const data: APIGatewayProxyEvent = {
      pathParameters: {
        id: bodyGetByUsername.result.items[0].id,
      },
    };

    const response = await getById.run(data);
    const body = JSON.parse(response.body);

    //console.log(response);

    expect(JSON.parse(response.statusCode)).to.be.equal(200);

    expect(body.result.email).to.be.equal('test@test.com');
    expect(body.result.totalPrice).to.be.equal(44);
    expect(body.result.products[0].id).to.be.equal(IDProduct1);
    expect(body.result.products[0].name).to.be.equal('name product 1');
    expect(body.result.products[0].description).to.be.equal('description product 1');
    expect(body.result.products[0].price).to.be.equal(11);
    expect(body.result.products[0].quantity).to.be.equal(4);
    expect(body.result.products[0].category).to.be.null;
    expect(body.result.products[0].imageUrl).to.be.null;
  });

  it('order getById function - should return "PathParameters missing"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters_error: {
        id: 'dummy_id',
      },
    };

    const response = await getById.run(data);

    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal('PathParameters missing');
  });

  it('order getById function - should return "Failed to get order"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        id_error: 'dummy_id',
      },
    };

    const response = await getById.run(data);

    expect(JSON.parse(response.statusCode)).to.be.equal(502);
    expect(JSON.parse(response.body).error).to.be.equal('Failed to get order');
  });

  it('order getById function - should return "Order not found"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        id: 'dummy_id',
      },
    };

    const response = await getById.run(data);

    expect(JSON.parse(response.statusCode)).to.be.equal(404);
    expect(JSON.parse(response.body).error).to.be.equal('Order not found');
  });

  after(async () => {
    //functions
    const deleteProduct = mochaPlugin.getWrapper(
      'index',
      '/src/endpoints/product/delete.ts',
      'index'
    );

    const deleteCart = mochaPlugin.getWrapper('index', '/src/endpoints/cart/delete.ts', 'index');

    //data
    const dataProduct1: APIGatewayProxyEvent = {
      pathParameters: {
        id: IDProduct1,
      },
    };

    const dataCart: APIGatewayProxyEvent = {
      pathParameters: {
        username: 'username-string-test',
      },
    };

    //delete product
    await deleteProduct.run(dataProduct1);

    //delete cart
    const result = await deleteCart.run(dataCart);
  });
});
