import { APIGatewayProxyEvent } from "aws-lambda";
import "./testConfig/localDynamoDb";

const mochaPlugin = require("serverless-mocha-plugin");

// test for empty table
describe("Category populate table", () => {
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

  it('category create function - should return "Body missing"', async () => {
    const data: APIGatewayProxyEvent = {
      dummy_body: {
        dummy: "dummy",
      },
    };

    const response = await createCategory.run(data);

    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal("Body missing");
  });

  it('category create function - should return "Error name value not found"', async () => {
    const data: APIGatewayProxyEvent = {
      body: `{"name_dummy": "dummy"}`,
    };

    const response = await createCategory.run(data);

    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal(
      "Error name value not found"
    );
  });

  it('category create function - should return "Category "dummy" created correctly"', async () => {
    const data: APIGatewayProxyEvent = {
      body: `{"name": "dummy"}`,
    };

    const response = await createCategory.run(data);

    expect(JSON.parse(response.statusCode)).to.be.equal(200);
    expect(JSON.parse(response.body).message).to.be.equal(
      'Category "dummy" created correctly'
    );
  });

  it('category delete function - should return "PathParameters missing"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters_dummy: {
        dummy: "dummy",
      },
    };

    const response = await deleteCategory.run(data);

    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal(
      "PathParameters missing"
    );
  });

  it('category delete function - should return "Failed to scan category"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        name_dummy: "dummy",
      },
    };

    const response = await deleteCategory.run(data);

    expect(JSON.parse(response.statusCode)).to.be.equal(502);
    expect(JSON.parse(response.body).error).to.be.equal(
      "Failed to scan category"
    );
  });

  it('category delete function - should return "Category deleted correctly"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        name: "dummy",
      },
    };

    const response = await deleteCategory.run(data);

    expect(JSON.parse(response.statusCode)).to.be.equal(200);
    expect(JSON.parse(response.body).message).to.be.equal(
      "Category deleted correctly"
    );
  });
});
