import { APIGatewayProxyEvent } from "aws-lambda";
import "./testConfig/localDynamoDb";

const mochaPlugin = require("serverless-mocha-plugin");

// test for empty table
describe("Tax empty table", () => {
  const expect = mochaPlugin.chai.expect;

  // functions of tax

  const getByNameTax = mochaPlugin.getWrapper(
    "index",
    "/src/endpoints/tax/getRateByName.ts",
    "index"
  );

  it('tax getByName function - should return "PathParameters missing"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters_dummy: {
        name: "IVA",
      },
    };
    const response = await getByNameTax.run(data);

    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal(
      "PathParameters missing"
    );
  });

  it('tax getByName function - should return "Tax not found"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        name: "IVA",
      },
    };
    const response = await getByNameTax.run(data);

    expect(JSON.parse(response.statusCode)).to.be.equal(404);
    expect(JSON.parse(response.body).error).to.be.equal("Tax not found");
  });

  it('tax getByName function - should return "Failed to get tax"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        name_dummy: "IVA",
      },
    };
    const response = await getByNameTax.run(data);

    expect(JSON.parse(response.statusCode)).to.be.equal(502);
    expect(JSON.parse(response.body).error).to.be.equal("Failed to get tax");
  });
});
