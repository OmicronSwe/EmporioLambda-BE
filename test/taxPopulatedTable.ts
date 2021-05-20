import { APIGatewayProxyEvent } from "aws-lambda";
import "./testConfig/localDynamoDb";
import Dynamo from "../src/services/dynamo/dynamo";

const mochaPlugin = require("serverless-mocha-plugin");

// test for populated table
describe("Tax populated table", () => {
  const expect = mochaPlugin.chai.expect;

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
    // data
    const dataTax = {
      name: "IVA",
      rate: 20,
    };
    await Dynamo.write(process.env.TAX_TABLE, dataTax);
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

    const dataUpdate: APIGatewayProxyEvent = {
      pathParameters: {
        name: "IVA",
      },
    };
    const responseAfterUpdate = await getByNameTax.run(dataUpdate);

    expect(JSON.parse(responseAfterUpdate.statusCode)).to.be.equal(200);
    expect(JSON.parse(responseAfterUpdate.body).rate).to.be.equal(30);
  });

  after(async () => {
    await Dynamo.delete(process.env.TAX_TABLE, "name", "IVA");
  });
});
