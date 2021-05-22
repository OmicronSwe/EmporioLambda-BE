import { APIGatewayProxyEvent } from "aws-lambda";
import "./testConfig/localDynamoDb";

const mochaPlugin = require("serverless-mocha-plugin");

// test for empty table
describe("Category populated table", () => {
  const expect = mochaPlugin.chai.expect;

  // functions of category

  const createCategory = mochaPlugin.getWrapper(
    "index",
    "/src/endpoints/category/create.ts",
    "index"
  );

  const deleteCategory = mochaPlugin.getWrapper(
    "index",
    "/src/endpoints/category/delete.ts",
    "index"
  );

  const listCategory = mochaPlugin.getWrapper(
    "index",
    "/src/endpoints/category/list.ts",
    "index"
  );

  before(async () => {
    // functions

    const createProduct = mochaPlugin.getWrapper(
      "index",
      "/src/endpoints/product/create.ts",
      "index"
    );

    // data
    const dataCategory: APIGatewayProxyEvent = {
      body: '{"name": "dummy"}',
    };

    const dataProduct: APIGatewayProxyEvent = {
      body:
        '{"name": "test", "description": "test_description", "price": 10, "category": "dummy"}',
    };

    // create category
    await createCategory.run(dataCategory);

    // create product
    await createProduct.run(dataProduct);
  });

  it('category list function - should return only category "dummy"', async () => {
    const response = await listCategory.run();

    expect(JSON.parse(response.statusCode)).to.be.equal(200);

    const body = JSON.parse(response.body);

    expect(body.result.items.length).to.be.equal(1);
    expect(body.result.items[0]).to.be.equal("dummy");
  });

  it('category create function - should return "Category already exists"', async () => {
    const data: APIGatewayProxyEvent = {
      body: `{"name": "dummy"}`,
    };

    const response = await createCategory.run(data);

    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal(
      "Category already exists"
    );
  });

  it('category delete function - should return "Category is being used"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        name: "dummy",
      },
    };

    const response = await deleteCategory.run(data);

    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal(
      "Category is being used"
    );
  });

  after(async () => {
    // functions

    const deleteProduct = mochaPlugin.getWrapper(
      "index",
      "/src/endpoints/product/delete.ts",
      "index"
    );

    const search = mochaPlugin.getWrapper(
      "index",
      "/src/endpoints/product/search.ts",
      "index"
    );

    // data
    const dataProduct: APIGatewayProxyEvent = {
      pathParameters: {
        search: encodeURIComponent("category=dummy"),
      },
    };

    const dataCategory: APIGatewayProxyEvent = {
      pathParameters: {
        name: "dummy",
      },
    };

    // delete product
    const responseSearch = await search.run(dataProduct);
    const id = JSON.parse(responseSearch.body).result.items[0].id;

    const dataSearch: APIGatewayProxyEvent = {
      pathParameters: {
        id,
      },
    };

    await deleteProduct.run(dataSearch);
    await deleteCategory.run(dataCategory);
  });
});
