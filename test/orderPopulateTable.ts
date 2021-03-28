import { APIGatewayProxyEvent } from "aws-lambda";

import "./localDynamoDb";

const mochaPlugin = require("serverless-mocha-plugin");

// test for populate table
describe("Order populate table", () => {
  const expect = mochaPlugin.chai.expect;
  let IDProduct1: string;
  let IDProduct2: string;

  // functions of order
  const create = mochaPlugin.getWrapper(
    "index",
    "/src/endpoints/order/create.ts",
    "index"
  );

  before(async () => {
    // functions
    const createProd = mochaPlugin.getWrapper(
      "index",
      "/src/endpoints/product/create.ts",
      "index"
    );
    const createCart = mochaPlugin.getWrapper(
      "index",
      "/src/endpoints/cart/create.ts",
      "index"
    );
    const search = mochaPlugin.getWrapper(
      "index",
      "/src/endpoints/product/search.ts",
      "index"
    );

    // data
    const dataProduct1: APIGatewayProxyEvent = {
      body:
        '{"description": "description product 1" ,"name": "name product 1", "price" : 11}',
    };

    const dataProduct2: APIGatewayProxyEvent = {
      body:
        '{"name": "name product 2 new", "price" : 21,"description": "description product 2"}',
    };

    // create product
    await createProd.run(dataProduct1);
    await createProd.run(dataProduct2);

    // get id
    let data: APIGatewayProxyEvent = {
      pathParameters: {
        search: encodeURIComponent("name=name product 1"),
      },
    };

    let responseSearch = await search.run(data);
    IDProduct1 = JSON.parse(responseSearch.body).result.items[0].id;

    data = {
      pathParameters: {
        search: encodeURIComponent("name=name product 2"),
      },
    };

    responseSearch = await search.run(data);
    IDProduct2 = JSON.parse(responseSearch.body).result.items[0].id;

    const dataCart: APIGatewayProxyEvent = {
      body: `{"username": "username-string", "products": [{"id": "${IDProduct1}", "quantity": 2},{"id": "${IDProduct2}" ,"quantity": 4}]}`,
    };

    // create cart
    await createCart.run(dataCart);
  });

  it('order create function - should be "Failed to get user data"', async () => {
    const data: APIGatewayProxyEvent = {
      body:
        '{"data": {"object": {"payment_status": "paid", "customer_details": {"email": "test@test.com"}, "client_reference_id": "username-string"}}}',
    };

    const response = await create.run(data);

    // console.log(response);
    expect(JSON.parse(response.statusCode)).to.be.equal(502);
    expect(JSON.parse(response.body).error).to.be.equal(
      "Failed to get user data"
    );
  });

  it('order create function - should be "Failed to create order"', async () => {
    const data: APIGatewayProxyEvent = {
      body:
        '{"data": {"object": {"payment_status": "not_paid", "customer_details": {"email": "test@test.com"}, "client_reference_id": "username-string"}}}',
    };

    const response = await create.run(data);

    // console.log(response);
    expect(JSON.parse(response.statusCode)).to.be.equal(502);
    expect(JSON.parse(response.body).error).to.be.equal(
      "Failed to create order"
    );
  });

  it('order create function - should be "Failed to get cart"', async () => {
    const data: APIGatewayProxyEvent = {
      body:
        '{"data": {"object": {"payment_status": "paid", "customer_details": {"email": "test@test.com"}, "client_reference": "username-string"}}}',
    };

    const response = await create.run(data);

    // console.log(response);
    expect(JSON.parse(response.statusCode)).to.be.equal(502);
    expect(JSON.parse(response.body).error).to.be.equal("Failed to get cart");
  });

  it('order create function - should be "Cart not found"', async () => {
    const data: APIGatewayProxyEvent = {
      body:
        '{"data": {"object": {"payment_status": "paid", "customer_details": {"email": "test@test.com"}, "client_reference_id": "username-string_error"}}}',
    };

    const response = await create.run(data);

    // console.log(response);
    expect(JSON.parse(response.statusCode)).to.be.equal(404);
    expect(JSON.parse(response.body).error).to.be.equal("Cart not found");
  });

  it('order create function - should be "Error email value not found"', async () => {
    const data: APIGatewayProxyEvent = {
      body:
        '{"data": {"object": {"payment_status": "paid", "customer_details": {"email_error": "test@test.com"}, "client_reference_id": "username-string"}}}',
    };

    const response = await create.run(data);

    // console.log(response);
    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal(
      "Error email value not found"
    );
  });

  after(async () => {
    // functions
    const deleteProduct = mochaPlugin.getWrapper(
      "index",
      "/src/endpoints/product/delete.ts",
      "index"
    );

    const deleteCart = mochaPlugin.getWrapper(
      "index",
      "/src/endpoints/cart/delete.ts",
      "index"
    );

    // data
    const dataProduct1: APIGatewayProxyEvent = {
      pathParameters: {
        id: IDProduct1,
      },
    };

    const dataProduct2: APIGatewayProxyEvent = {
      pathParameters: {
        id: IDProduct2,
      },
    };

    const dataCart: APIGatewayProxyEvent = {
      pathParameters: {
        username: "username-string",
      },
    };

    // delete product
    await deleteProduct.run(dataProduct1);
    await deleteProduct.run(dataProduct2);

    // delete cart
    await deleteCart.run(dataCart);
  });
});
