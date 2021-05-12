import "./testConfig/localDynamoDb";

const mochaPlugin = require("serverless-mocha-plugin");

// test for empty table
describe("Category empty table", () => {
  const expect = mochaPlugin.chai.expect;

  // functions of category

  const listCategory = mochaPlugin.getWrapper(
    "index",
    "/src/endpoints/category/list.ts",
    "index"
  );

  it('category list function - should return "Categories not found"', async () => {
    const response = await listCategory.run();

    expect(JSON.parse(response.statusCode)).to.be.equal(404);
    expect(JSON.parse(response.body).error).to.be.equal("Categories not found");
  });
});
