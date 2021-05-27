import { APIGatewayProxyEvent } from "aws-lambda";
import "./testConfig/localDynamoDb";
import Dynamo from "../src/services/dynamo/dynamo";

const mochaPlugin = require("serverless-mocha-plugin");

// test for populated table
describe("Tax populated table", () => {
  const expect = mochaPlugin.chai.expect;
  let IDProduct1: string;
  let IDProduct2: string;

  const getByNameTax = mochaPlugin.getWrapper(
    "index",
    "/src/endpoints/tax/getRateByName.ts",
    "index"
  );

  const updateTax = mochaPlugin.getWrapper(
    "index",
    "/src/endpoints/tax/update.ts",
    "index"
  );

  before(async () => {
    // data tax
    const dataTax = {
      name: "IVA",
      rate: 20,
    };
    await Dynamo.write(process.env.TAX_TABLE, dataTax);

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
      body: '{"description": "description product 1" ,"name": "name product 1", "price" : 11}',
    };

    const dataProduct2: APIGatewayProxyEvent = {
      body: '{"name": "name product 2 new", "price" : 21,"description": "description product 2"}',
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

  it('tax getByName function - should return "rate: 20"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        name: "IVA",
      },
    };
    const response = await getByNameTax.run(data);

    expect(JSON.parse(response.statusCode)).to.be.equal(200);
    expect(JSON.parse(response.body).rate).to.be.equal(20);
  });

  it('tax update function - should return "PathParameters missing"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters_dummy: {
        name: "IVA",
      },
      body: '{"rate":20}',
    };
    const response = await updateTax.run(data);

    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal(
      "PathParameters missing"
    );
  });

  it('tax update function - should return "Body missing"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        name: "IVA",
      },
      body_dummy: '{"rate":20}',
    };
    const response = await updateTax.run(data);

    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal("Body missing");
  });

  it('tax update function - should return "Tax not exist"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        name: "IVA_dummy",
      },
      body: '{"rate":20}',
    };
    const response = await updateTax.run(data);

    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal("Tax not exist");
  });

  it('tax update function - should return "Failed to check if tax exist"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        name_dummy: "IVA",
      },
      body: '{"rate":20}',
    };
    const response = await updateTax.run(data);

    expect(JSON.parse(response.statusCode)).to.be.equal(502);
    expect(JSON.parse(response.body).error).to.be.equal(
      "Failed to check if tax exist"
    );
  });

  it('tax update function - should return "Tax update correctly"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        name: "IVA",
      },
      body: '{"rate":30}',
    };
    const response = await updateTax.run(data);

    expect(JSON.parse(response.statusCode)).to.be.equal(200);
    expect(JSON.parse(response.body).message).to.be.equal(
      "Tax update correctly"
    );

    // check update tax
    const dataUpdate: APIGatewayProxyEvent = {
      pathParameters: {
        name: "IVA",
      },
    };
    const responseAfterUpdate = await getByNameTax.run(dataUpdate);

    expect(JSON.parse(responseAfterUpdate.statusCode)).to.be.equal(200);
    expect(JSON.parse(responseAfterUpdate.body).rate).to.be.equal(30);

    // check if product in cart have differente taxes and totalPrice
    // functions of cart
    const getByUsername = mochaPlugin.getWrapper(
      "index",
      "/src/endpoints/cart/getByUsername.ts",
      "index"
    );

    const dataCart: APIGatewayProxyEvent = {
      pathParameters: {
        username: "username-string",
      },
    };

    const responseGetCart = await getByUsername.run(dataCart);

    const body = JSON.parse(responseGetCart.body);

    expect(JSON.parse(responseGetCart.statusCode)).to.be.equal(200);
    expect(body.result.taxesApplied).to.be.equal(30);
    expect(body.result.totalPrice).to.be.equal(137.8);
    expect(body.result.username).to.be.equal("username-string");
    expect(body.result.products.length).to.be.equal(2);
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

    const dataProduct2: APIGatewayProxyEvent = {
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
    await deleteProduct.run(dataProduct2);

    // delete cart
    await deleteCart.run(dataCart);

    // delete tax
    await Dynamo.delete(process.env.TAX_TABLE, "name", "IVA");
  });
});
