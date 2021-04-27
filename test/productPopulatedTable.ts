import { APIGatewayProxyEvent } from "aws-lambda";

import "./testConfig/localDynamoDb";

const mochaPlugin = require("serverless-mocha-plugin");

// test for populated table
describe("Product populated table", () => {
  const expect = mochaPlugin.chai.expect;

  // functions of product
  const list = mochaPlugin.getWrapper(
    "index",
    "/src/endpoints/product/list.ts",
    "index"
  );
  const search = mochaPlugin.getWrapper(
    "index",
    "/src/endpoints/product/search.ts",
    "index"
  );
  const getById = mochaPlugin.getWrapper(
    "index",
    "/src/endpoints/product/getById.ts",
    "index"
  );

  before(async () => {
    // functions
    const createCategory = mochaPlugin.getWrapper(
      "index",
      "/src/endpoints/category/create.ts",
      "index"
    );

    const createProduct = mochaPlugin.getWrapper(
      "index",
      "/src/endpoints/product/create.ts",
      "index"
    );

    // data
    const dataCategory1: APIGatewayProxyEvent = {
      body: '{"name": "garden"}',
    };

    const dataCategory2: APIGatewayProxyEvent = {
      body: '{"name": "electric"}',
    };

    const dataProduct1: APIGatewayProxyEvent = {
      body:
        '{"name": "test", "description": "test_description", "price": 10, "category": "electric"}',
    };
    const dataProduct2: APIGatewayProxyEvent = {
      body:
        '{"name": "test 2", "description": "test_description2", "price": 20, "category": "garden"}',
    };

    // create category
    await createCategory.run(dataCategory1);
    await createCategory.run(dataCategory2);

    // create product
    await createProduct.run(dataProduct1);
    await createProduct.run(dataProduct2);
  });

  it('product list function - should contains item "test" and "test 2"', async () => {
    const response = await list.run();

    const body = JSON.parse(response.body);

    expect(JSON.parse(response.statusCode)).to.be.equal(200);

    expect(body.result.items.length).to.be.equal(2);

    let indexTest: number;
    let indexTest2: number;

    if (body.result.items[0].name == "test") {
      indexTest = 0;
      indexTest2 = 1;
    } else {
      indexTest = 1;
      indexTest2 = 0;
    }

    expect(body.result.items[indexTest].name).to.be.equal("test");
    expect(body.result.items[indexTest].description).to.be.equal(
      "test_description"
    );
    expect(body.result.items[indexTest].price).to.be.equal(10);
    expect(body.result.items[indexTest].category).to.be.equal("electric");
    expect(body.result.items[indexTest].imageUrl).to.be.null;

    expect(body.result.items[indexTest2].name).to.be.equal("test 2");
    expect(body.result.items[indexTest2].description).to.be.equal(
      "test_description2"
    );
    expect(body.result.items[indexTest2].price).to.be.equal(20);
    expect(body.result.items[indexTest2].category).to.be.equal("garden");
    expect(body.result.items[indexTest2].imageUrl).to.be.null;
  });

  it('product search function - should contains only item "test 2"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        search: encodeURIComponent(
          "name=st 2&minprice=10&maxprice=20&category=garden,electric"
        ),
      },
    };

    // console.log(data);
    const response = await search.run(data);

    const body = JSON.parse(response.body);

    expect(body.result.items.length).to.be.equal(1);
    expect(JSON.parse(response.statusCode)).to.be.equal(200);
    expect(body.result.items[0].name).to.be.equal("test 2");
    expect(body.result.items[0].description).to.be.equal("test_description2");
    expect(body.result.items[0].price).to.be.equal(20);
    expect(body.result.items[0].category).to.be.equal("garden");
    expect(body.result.items[0].imageUrl).to.be.null;
  });

  it('product search function - should contains item "test" and "test 2"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        search: encodeURIComponent(
          "minprice=10&maxprice=20&category=garden,electric"
        ),
      },
    };

    // console.log(data);
    const response = await search.run(data);

    expect(JSON.parse(response.statusCode)).to.be.equal(200);

    const body = JSON.parse(response.body);

    expect(body.result.items.length).to.be.equal(2);

    let indexTest: number;
    let indexTest2: number;

    if (body.result.items[0].name == "test") {
      indexTest = 0;
      indexTest2 = 1;
    } else {
      indexTest = 1;
      indexTest2 = 0;
    }

    expect(body.result.items[indexTest].name).to.be.equal("test");
    expect(body.result.items[indexTest].description).to.be.equal(
      "test_description"
    );
    expect(body.result.items[indexTest].price).to.be.equal(10);
    expect(body.result.items[indexTest].category).to.be.equal("electric");
    expect(body.result.items[indexTest].imageUrl).to.be.null;

    expect(body.result.items[indexTest2].name).to.be.equal("test 2");
    expect(body.result.items[indexTest2].description).to.be.equal(
      "test_description2"
    );
    expect(body.result.items[indexTest2].price).to.be.equal(20);
    expect(body.result.items[indexTest2].category).to.be.equal("garden");
    expect(body.result.items[indexTest2].imageUrl).to.be.null;
  });

  it('product search function - should contains only item "test" by max price', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        search: encodeURIComponent("maxprice=10"),
      },
    };

    // console.log(data);
    const response = await search.run(data);

    const body = JSON.parse(response.body);

    expect(body.result.items.length).to.be.equal(1);
    expect(JSON.parse(response.statusCode)).to.be.equal(200);
    expect(body.result.items[0].name).to.be.equal("test");
    expect(body.result.items[0].description).to.be.equal("test_description");
    expect(body.result.items[0].price).to.be.equal(10);
    expect(body.result.items[0].category).to.be.equal("electric");
    expect(body.result.items[0].imageUrl).to.be.null;
  });

  it('product search function - should contains item "test" by category', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        search: encodeURIComponent("category=electric"),
      },
    };

    // console.log(data);
    const response = await search.run(data);

    const body = JSON.parse(response.body);

    expect(JSON.parse(response.statusCode)).to.be.equal(200);
    expect(body.result.items.length).to.be.equal(1);
    expect(body.result.items[0].name).to.be.equal("test");
    expect(body.result.items[0].description).to.be.equal("test_description");
    expect(body.result.items[0].price).to.be.equal(10);
    expect(body.result.items[0].category).to.be.equal("electric");
    expect(body.result.items[0].imageUrl).to.be.null;
  });

  it('product search function - should contains item "test 2" by min price', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        search: encodeURIComponent("minprice=12"),
      },
    };

    // console.log(data);
    const response = await search.run(data);

    const body = JSON.parse(response.body);

    expect(body.result.items.length).to.be.equal(1);
    expect(JSON.parse(response.statusCode)).to.be.equal(200);
    expect(body.result.items[0].name).to.be.equal("test 2");
    expect(body.result.items[0].description).to.be.equal("test_description2");
    expect(body.result.items[0].price).to.be.equal(20);
    expect(body.result.items[0].category).to.be.equal("garden");
    expect(body.result.items[0].imageUrl).to.be.null;
  });

  it("product search function - should contains one item by limit 1 and different item next lastEvaluatedKey", async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        search: encodeURIComponent("limit=1"),
      },
    };

    // limit1
    const response = await search.run(data);

    const body = JSON.parse(response.body);

    // console.log(response);

    expect(body.result.items.length).to.be.equal(1);

    const lastEvaluatedKey = body.result.lastEvaluatedKey;

    const nameProductReturned = body.result.items[0].name;

    // ExclusiveStartKey
    const dataExclusiveStartKey: APIGatewayProxyEvent = {
      pathParameters: {
        search: encodeURIComponent(
          `lastEvaluatedKey=${JSON.stringify(lastEvaluatedKey)}`
        ),
      },
    };

    // console.log(dataExclusiveStartKey)

    const responseExclusiveStartKey = await search.run(dataExclusiveStartKey);

    const bodyExclusiveStartKey = JSON.parse(responseExclusiveStartKey.body);

    // console.log(responseExclusiveStartKey);

    expect(bodyExclusiveStartKey.result.items.length).to.be.equal(1);
    expect(bodyExclusiveStartKey.result.items[0].name).to.not.be.equal(
      nameProductReturned
    );
  });

  it('product getById function - should return item "test"', async () => {
    // get id
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        search: encodeURIComponent("category=electric"),
      },
    };

    const responseSearch = await search.run(data);
    const id = JSON.parse(responseSearch.body).result.items[0].id;

    const dataSearch: APIGatewayProxyEvent = {
      pathParameters: {
        id,
      },
    };

    const response = await getById.run(dataSearch);
    const body = JSON.parse(response.body);
    // console.log(response);
    expect(JSON.parse(response.statusCode)).to.be.equal(200);

    expect(body.result.name).to.be.equal("test");
    expect(body.result.description).to.be.equal("test_description");
    expect(body.result.price).to.be.equal(10);
    expect(body.result.category).to.be.equal("electric");
    expect(body.result.imageUrl).to.be.null;
  });

  after(async () => {
    // functions
    const deleteCategory = mochaPlugin.getWrapper(
      "index",
      "/src/endpoints/category/delete.ts",
      "index"
    );

    const deleteProduct = mochaPlugin.getWrapper(
      "index",
      "/src/endpoints/product/delete.ts",
      "index"
    );

    // data
    const dataProduct1: APIGatewayProxyEvent = {
      pathParameters: {
        search: encodeURIComponent("name=test 2"),
      },
    };

    const dataProduct2: APIGatewayProxyEvent = {
      pathParameters: {
        search: encodeURIComponent("category=electric"),
      },
    };

    const dataCategory1: APIGatewayProxyEvent = {
      pathParameters: {
        name: "garden",
      },
    };

    const dataCategory2: APIGatewayProxyEvent = {
      pathParameters: {
        name: "electric",
      },
    };

    // delete product 1
    let responseSearch = await search.run(dataProduct1);
    let id = JSON.parse(responseSearch.body).result.items[0].id;

    let dataSearch: APIGatewayProxyEvent = {
      pathParameters: {
        id,
      },
    };

    await deleteProduct.run(dataSearch);

    // delete product 2
    responseSearch = await search.run(dataProduct2);
    id = JSON.parse(responseSearch.body).result.items[0].id;

    dataSearch = {
      pathParameters: {
        id,
      },
    };

    await deleteProduct.run(dataSearch);

    // delete category
    await deleteCategory.run(dataCategory1);
    await deleteCategory.run(dataCategory2);
  });
});
