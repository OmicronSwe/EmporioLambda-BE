import { APIGatewayProxyEvent } from "aws-lambda";
import "./testConfig/localDynamoDb";

const mochaPlugin = require("serverless-mocha-plugin");

// test for checkout
describe("Checkout create session Stripe", () => {
  const expect = mochaPlugin.chai.expect;
  let IDProduct1: string;
  let IDProduct2: string;

  // functions of checkout
  const createSessionStripe = mochaPlugin.getWrapper(
    "index",
    "/src/endpoints/checkout/createSessionStripe.ts",
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
    const updateProd = mochaPlugin.getWrapper(
      "index",
      "/src/endpoints/product/update.ts",
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

    // update product after create cart
    const dataUpdate: APIGatewayProxyEvent = {
      body:
        '{"name": "test_update", "description": "test_description_update", "price": 20, "category": "garden"}',
      pathParameters: {
        id: IDProduct2,
      },
    };

    await updateProd.run(dataUpdate);
  });

  it('checkout createSessionStripe function - should be "Body missing"', async () => {
    const data: APIGatewayProxyEvent = {
      body_error: "dummy",
    };

    const response = await createSessionStripe.run(data);

    // console.log(response);
    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal("Body missing");
  });

  it('checkout createSessionStripe function - should be "Failed to get cart"', async () => {
    const data: APIGatewayProxyEvent = {
      body: '{"username_error":"username"}',
    };

    const response = await createSessionStripe.run(data);

    // console.log(response);
    expect(JSON.parse(response.statusCode)).to.be.equal(502);
    expect(JSON.parse(response.body).error).to.be.equal("Failed to get cart");
  });

  it('checkout createSessionStripe function - should be "Some products have changed, please check your shopping cart before proceeding"', async () => {
    const data: APIGatewayProxyEvent = {
      body: '{"username":"username-string"}',
    };

    const response = await createSessionStripe.run(data);

    // console.log(response);
    expect(JSON.parse(response.statusCode)).to.be.equal(502);
    expect(JSON.parse(response.body).error).to.be.equal(
      "Some products have changed, please check your shopping cart before proceeding"
    );
  });

  it('checkout createSessionStripe function - should be "Some products are no longer available, please check your shopping cart before proceeding"', async () => {
    const deleteProduct = mochaPlugin.getWrapper(
      "index",
      "/src/endpoints/product/delete.ts",
      "index"
    );
    const dataProductDelete2: APIGatewayProxyEvent = {
      pathParameters: {
        id: IDProduct2,
      },
    };

    await deleteProduct.run(dataProductDelete2);

    const data: APIGatewayProxyEvent = {
      body: '{"username":"username-string"}',
    };

    const response = await createSessionStripe.run(data);

    // console.log(response);
    expect(JSON.parse(response.statusCode)).to.be.equal(404);
    expect(JSON.parse(response.body).error).to.be.equal(
      "Some products are no longer available, please check your shopping cart before proceeding"
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

    const dataProduct1: APIGatewayProxyEvent = {
      pathParameters: {
        id: IDProduct1,
      },
    };

    const dataCart: APIGatewayProxyEvent = {
      pathParameters: {
        username: "username-string",
      },
    };
    // delete product
    await deleteProduct.run(dataProduct1);

    // delete cart
    await deleteCart.run(dataCart);
  });
});
