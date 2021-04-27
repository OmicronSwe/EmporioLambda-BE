import { APIGatewayProxyEvent } from "aws-lambda";
import "./testConfig/localDynamoDb";
import Dynamo from "../src/services/dynamo/dynamo";
import tableName from "../src/services/dynamo/tableName";
import Order from "../src/model/order/order";
import Cart from "../src/model/cart/cart";
import { OrderDB } from "../src/model/order/interface";

const mochaPlugin = require("serverless-mocha-plugin");

// test for checkout
describe("User functions test", () => {
  const expect = mochaPlugin.chai.expect;
  let IDProduct1;

  // functions of user
  const deleteUser = mochaPlugin.getWrapper(
    "index",
    "/src/endpoints/user/delete.ts",
    "index"
  );

  before(async () => {
    // functions
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

    // create product
    await createProd.run(dataProduct1);

    // get id
    const dataId: APIGatewayProxyEvent = {
      pathParameters: {
        search: encodeURIComponent("name=name product 1"),
      },
    };

    const responseSearch = await search.run(dataId);
    IDProduct1 = JSON.parse(responseSearch.body).result.items[0].id;

    const dataCart: APIGatewayProxyEvent = {
      body: `{"username": "username-string-test-delete-user", "products": [{"id": "${IDProduct1}" ,"quantity": 4}]}`,
    };

    // create cart
    await createCart.run(dataCart);

    const result = await Dynamo.get(
      tableName.cart,
      "username",
      "username-string-test-delete-user"
    ).catch(() => {
      // handle error of dynamoDB
      return null;
    });

    // push data to dynamodb
    const cart: Cart = new Cart(result);
    const order: Order = new Order(cart, "test@test.com");

    const data: OrderDB = order.toJSON();

    await Dynamo.write(tableName.order, data);
  });

  it('user delete function - should be "Failed to delete user"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        username: "username-string-test-delete-user",
      },
    };

    const response = await deleteUser.run(data);
    expect(JSON.parse(response.statusCode)).to.be.equal(502);
    expect(JSON.parse(response.body).error).to.be.equal(
      "Failed to delete user"
    );
  });

  after(async () => {
    // functions
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

    // data
    const dataProduct1: APIGatewayProxyEvent = {
      pathParameters: {
        id: IDProduct1,
      },
    };

    const dataCart: APIGatewayProxyEvent = {
      pathParameters: {
        username: "username-string-test-delete-user",
      },
    };

    // delete product
    await deleteProduct.run(dataProduct1);

    // delete cart
    await deleteCart.run(dataCart);
  });
});
