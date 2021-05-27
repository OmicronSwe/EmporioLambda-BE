const mochaPlugin = require("serverless-mocha-plugin");

// test for empty order
describe("Order empty table", () => {
  const expect = mochaPlugin.chai.expect;

  // functions of order

  const listOrder = mochaPlugin.getWrapper(
    "index",
    "/src/endpoints/order/list.ts",
    "index"
  );

  it('order list function - should return "Orders not found"', async () => {
    const response = await listOrder.run();

    expect(JSON.parse(response.statusCode)).to.be.equal(404);
    expect(JSON.parse(response.body).error).to.be.equal("Orders not found");
  });
});
