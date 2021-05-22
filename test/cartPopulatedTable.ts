import { APIGatewayProxyEvent } from "aws-lambda";
import "./testConfig/localDynamoDb";
import Dynamo from "../src/services/dynamo/dynamo";

const mochaPlugin = require("serverless-mocha-plugin");

// test for populate table
describe("Cart populated table", () => {
  const expect = mochaPlugin.chai.expect;
  let IDProduct1: string;
  let IDProduct2: string;

  // functions of cart
  const getByUsername = mochaPlugin.getWrapper(
    "index",
    "/src/endpoints/cart/getByUsername.ts",
    "index"
  );

  before(async () => {
    const dataTax = {
      name: "IVA",
      rate: 20,
    };
    await Dynamo.write(process.env.TAX_TABLE, dataTax);

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

    // delete product after create cart
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
  });

  it('cart getByUsername function - should be return cart "username-string" without product "name product new 2"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        username: "username-string",
      },
    };

    const response = await getByUsername.run(data);

    const body = JSON.parse(response.body);

    expect(JSON.parse(response.statusCode)).to.be.equal(200);
    expect(body.result.taxesApplied).to.be.equal(20);
    expect(body.result.totalPrice).to.be.equal(26.4);
    expect(body.result.username).to.be.equal("username-string");
    expect(body.result.products.length).to.be.equal(1);
    expect(body.result.products[0].id).to.be.equal(IDProduct1);
    expect(body.result.products[0].name).to.be.equal("name product 1");
    expect(body.result.products[0].description).to.be.equal(
      "description product 1"
    );
    expect(body.result.products[0].price).to.be.equal(11);
    expect(body.result.products[0].quantity).to.be.equal(2);
    expect(body.result.products[0].imageUrl).to.be.null;
    expect(body.result.products[0].category).to.be.null;
    expect(body.messageChange[0]).to.be.equal(
      'Product "name product 2 new" no longer available'
    );
  });

  it('cart getByUsername function - should be "PathParameters missing"', async () => {
    const errorData: APIGatewayProxyEvent = {
      body: `{"id": ${IDProduct1}, "quantity": 2}`,
    };

    const response = await getByUsername.run(errorData);
    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal(
      "PathParameters missing"
    );
  });

  it('cart getByUsername function - should be "Failed to get cart"', async () => {
    const errorData: APIGatewayProxyEvent = {
      pathParameters: {
        name: "dummy",
      },
    };

    const response = await getByUsername.run(errorData);
    expect(JSON.parse(response.statusCode)).to.be.equal(502);
    expect(JSON.parse(response.body).error).to.be.equal("Failed to get cart");
  });

  it('cart getByUsername function - should be "Cart not found"', async () => {
    const errorData: APIGatewayProxyEvent = {
      pathParameters: {
        username: "dummy-string",
      },
    };

    const response = await getByUsername.run(errorData);
    expect(JSON.parse(response.statusCode)).to.be.equal(404);
    expect(JSON.parse(response.body).error).to.be.equal("Cart not found");
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

    // delete tax
    await Dynamo.delete(process.env.TAX_TABLE, "name", "IVA");
  });
});
