import { APIGatewayProxyEvent } from "aws-lambda";

import "./testConfig/localDynamoDb";

const mochaPlugin = require("serverless-mocha-plugin");

// test for populate table
describe("Cart populate table", () => {
  const expect = mochaPlugin.chai.expect;
  let IDProduct1: string;
  let IDProduct2: string;

  // functions of cart
  const create = mochaPlugin.getWrapper(
    "index",
    "/src/endpoints/cart/create.ts",
    "index"
  );
  const addProduct = mochaPlugin.getWrapper(
    "index",
    "/src/endpoints/cart/addProduct.ts",
    "index"
  );
  const getByUsername = mochaPlugin.getWrapper(
    "index",
    "/src/endpoints/cart/getByUsername.ts",
    "index"
  );
  const deleteFun = mochaPlugin.getWrapper(
    "index",
    "/src/endpoints/cart/delete.ts",
    "index"
  );
  const removeProduct = mochaPlugin.getWrapper(
    "index",
    "/src/endpoints/cart/removeProduct.ts",
    "index"
  );
  const toEmpty = mochaPlugin.getWrapper(
    "index",
    "/src/endpoints/cart/toEmpty.ts",
    "index"
  );

  before(async () => {
    const createProd = mochaPlugin.getWrapper(
      "index",
      "/src/endpoints/product/create.ts",
      "index"
    );
    const search = mochaPlugin.getWrapper(
      "index",
      "/src/endpoints/product/search.ts",
      "index"
    );

    const dataProduct1: APIGatewayProxyEvent = {
      body: '{"description": "description product 1" ,"name": "name product 1", "price" : 11}',
    };
    const dataProduct2: APIGatewayProxyEvent = {
      body: '{"name": "name product 2", "price" : 21,"description": "description product 2"}',
    };

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
  });

  it('cart create function - should be "Cart saved"', async () => {
    const data: APIGatewayProxyEvent = {
      body: `{"username": "username-string", "products": [{"id": "${IDProduct1}","quantity": 2},{"id": "${IDProduct2}","quantity": 4}]}`,
    };

    const response = await create.run(data);

    // console.log(response);
    expect(JSON.parse(response.statusCode)).to.be.equal(200);
    expect(JSON.parse(response.body).message).to.be.equal("Cart saved");
  });

  it('cart create function - should be "Body missing"', async () => {
    const data: APIGatewayProxyEvent = {
      dummy: `{"username": "username-string", "products": [{"id": "${IDProduct1}","quantity": 2},{"id": "${IDProduct2}","quantity": 4}]}`,
    };

    const response = await create.run(data);

    // console.log(response);
    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal("Body missing");
  });

  it('cart create function - should be "Error username value not found"', async () => {
    const data: APIGatewayProxyEvent = {
      body: `{"dummy": "username-string", "products": [{"id": "${IDProduct1}","quantity": 2},{"id": "${IDProduct2}","quantity": 4}]}`,
    };

    const response = await create.run(data);

    // console.log(response);
    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal(
      "Error username value not found"
    );
  });

  it('cart create function - should be "Failed to save cart"', async () => {
    const errorData: APIGatewayProxyEvent = {
      body: `{"username": 1, "products": [{"id": "${IDProduct1}","quantity": 2},{"id": "${IDProduct2}","quantity": 4}]}`,
    };

    const response = await create.run(errorData);
    expect(JSON.parse(response.statusCode)).to.be.equal(502);
    expect(JSON.parse(response.body).error).to.be.equal("Failed to save cart");
  });

  it('cart getByUsername function - should be return "username-string" cart', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        username: "username-string",
      },
    };

    const response = await getByUsername.run(data);

    const body = JSON.parse(response.body);

    expect(JSON.parse(response.statusCode)).to.be.equal(200);
    expect(body.result.taxesApplied).to.be.equal(20);
    expect(body.result.totalPrice).to.be.equal(127.2);
    expect(body.result.username).to.be.equal("username-string");
  });

  it('cart addProduct function - should be add item to "username-string"', async () => {
    const data: APIGatewayProxyEvent = {
      body: `{"id": "${IDProduct2}", "quantity": 2}`,
      pathParameters: {
        username: "username-string",
      },
    };

    const response = await addProduct.run(data);

    expect(JSON.parse(response.statusCode)).to.be.equal(200);
    expect(JSON.parse(response.body).message).to.be.equal(
      'Product "name product 2" added to cart'
    );
  });

  it('cart getByUsername function - should be return "username-string" with updated price after add', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        username: "username-string",
      },
    };

    const response = await getByUsername.run(data);

    const body = JSON.parse(response.body);

    expect(JSON.parse(response.statusCode)).to.be.equal(200);
    expect(body.result.taxesApplied).to.be.equal(20);
    expect(body.result.totalPrice).to.be.equal(177.6);
    expect(body.result.username).to.be.equal("username-string");
    expect(body.result.products.length).to.be.equal(2);
  });

  it('cart addProduct function - should be "Body missing"', async () => {
    const errorData: APIGatewayProxyEvent = {
      dummy: '{"name": 1, "description": 2}',
      pathParameters: {
        name: "dummy",
      },
    };

    const response = await addProduct.run(errorData);
    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal("Body missing");
  });

  it('cart addProduct function - should be "PathParameters missing"', async () => {
    const errorData: APIGatewayProxyEvent = {
      body: `{"id": "${IDProduct1}", "quantity": 2}`,
    };

    const response = await addProduct.run(errorData);
    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal(
      "PathParameters missing"
    );
  });

  it('cart addProduct function - should be "Failed to get cart"', async () => {
    const errorData: APIGatewayProxyEvent = {
      body: `{"id": "${IDProduct1}", "quantity": 2}`,
      pathParameters: {
        name: "dummy",
      },
    };

    const response = await addProduct.run(errorData);
    expect(JSON.parse(response.statusCode)).to.be.equal(502);
    expect(JSON.parse(response.body).error).to.be.equal("Failed to get cart");
  });

  it('cart addProduct function - should be add item to "username-string2" without have a cart before', async () => {
    const data: APIGatewayProxyEvent = {
      body: `{"id": "${IDProduct1}", "quantity": 2}`,
      pathParameters: {
        username: "username-string2",
      },
    };

    const response = await addProduct.run(data);
    expect(JSON.parse(response.statusCode)).to.be.equal(200);
    expect(JSON.parse(response.body).message).to.be.equal(
      'Product "name product 1" added to cart'
    );
  });

  it('cart addProduct function - should be add item to "username-string2" by quantity:', async () => {
    const data: APIGatewayProxyEvent = {
      body: `{"id": "${IDProduct1}", "quantity": 2}`,
      pathParameters: {
        username: "username-string2",
      },
    };

    const response = await addProduct.run(data);

    expect(JSON.parse(response.statusCode)).to.be.equal(200);
    expect(JSON.parse(response.body).message).to.be.equal(
      'Product "name product 1" added to cart'
    );

    // check if cart is updated

    const dataGet: APIGatewayProxyEvent = {
      pathParameters: {
        username: "username-string2",
      },
    };

    const responseGet = await getByUsername.run(dataGet);

    const body = JSON.parse(responseGet.body);

    expect(JSON.parse(response.statusCode)).to.be.equal(200);
    expect(body.result.taxesApplied).to.be.equal(20);
    expect(body.result.totalPrice).to.be.equal(52.8);
    expect(body.result.username).to.be.equal("username-string2");
    expect(body.result.products.length).to.be.equal(1);
    expect(body.result.products[0].id).to.be.equal(IDProduct1);
    expect(body.result.products[0].name).to.be.equal("name product 1");
    expect(body.result.products[0].description).to.be.equal(
      "description product 1"
    );
    expect(body.result.products[0].price).to.be.equal(11);
    expect(body.result.products[0].quantity).to.be.equal(4);
    expect(body.result.products[0].imageUrl).to.be.null;
    expect(body.result.products[0].category).to.be.null;
  });

  it('cart addProduct function - should be "Failed to get product"', async () => {
    const errorData: APIGatewayProxyEvent = {
      body: `{"dummy": "${IDProduct1}", "quantity": 2}`,
      pathParameters: {
        username: "username-string",
      },
    };

    const response = await addProduct.run(errorData);
    expect(JSON.parse(response.statusCode)).to.be.equal(502);
    expect(JSON.parse(response.body).error).to.be.equal(
      "Failed to get product"
    );
  });

  it('cart addProduct function - should be "Product not found"', async () => {
    const errorData: APIGatewayProxyEvent = {
      body: '{"id": "dummy_id_dummy", "quantity": 2}',
      pathParameters: {
        username: "username-string",
      },
    };

    const response = await addProduct.run(errorData);
    expect(JSON.parse(response.statusCode)).to.be.equal(404);
    expect(JSON.parse(response.body).error).to.be.equal("Product not found");
  });

  it('cart removeProduct function - should be "Product "name product 1" removed from cart"', async () => {
    const data: APIGatewayProxyEvent = {
      body: `{"id": "${IDProduct1}", "quantity": 2}`,
      pathParameters: {
        username: "username-string",
      },
    };

    const response = await removeProduct.run(data);

    expect(JSON.parse(response.statusCode)).to.be.equal(200);
    expect(JSON.parse(response.body).message).to.be.equal(
      'Product "name product 1" removed from cart'
    );
  });

  it('cart getByUsername function - should be return "username-string" with updated price after remove', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        username: "username-string",
      },
    };

    const response = await getByUsername.run(data);

    const body = JSON.parse(response.body);

    expect(JSON.parse(response.statusCode)).to.be.equal(200);
    expect(body.result.taxesApplied).to.be.equal(20);
    expect(body.result.totalPrice).to.be.equal(151.2);
    expect(body.result.username).to.be.equal("username-string");
    expect(body.result.products.length).to.be.equal(1);
    expect(body.result.products[0].id).to.be.equal(IDProduct2);
    expect(body.result.products[0].name).to.be.equal("name product 2");
    expect(body.result.products[0].description).to.be.equal(
      "description product 2"
    );
    expect(body.result.products[0].price).to.be.equal(21);
    expect(body.result.products[0].quantity).to.be.equal(6);
    expect(body.result.products[0].imageUrl).to.be.null;
    expect(body.result.products[0].category).to.be.null;
  });

  it('cart getByUsername function - should be return "username-string" with update product', async () => {
    // update product
    const updateProduct = mochaPlugin.getWrapper(
      "index",
      "/src/endpoints/product/update.ts",
      "index"
    );

    const dataProduct: APIGatewayProxyEvent = {
      body: '{"name": "test_update", "description": "test_description_update", "price": 20, "category":"garden"}',
      pathParameters: {
        id: IDProduct2,
      },
    };

    await updateProduct.run(dataProduct);

    // get cart
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        username: "username-string",
      },
    };

    const response = await getByUsername.run(data);

    const body = JSON.parse(response.body);

    expect(JSON.parse(response.statusCode)).to.be.equal(200);
    expect(body.result.taxesApplied).to.be.equal(20);
    expect(body.result.totalPrice).to.be.equal(144);
    expect(body.result.username).to.be.equal("username-string");
    expect(body.result.products.length).to.be.equal(1);
    expect(body.result.products[0].id).to.be.equal(IDProduct2);
    expect(body.result.products[0].name).to.be.equal("test_update");
    expect(body.result.products[0].description).to.be.equal(
      "test_description_update"
    );
    expect(body.result.products[0].price).to.be.equal(20);
    expect(body.result.products[0].quantity).to.be.equal(6);
    expect(body.result.products[0].imageUrl).to.be.null;
    expect(body.result.products[0].category).to.be.equal("garden");
    expect(body.messageChange[0]).to.be.equal(
      '"name product 2" product has been modified'
    );
  });

  it('cart removeProduct function - should be "Product not found in the cart"', async () => {
    const data: APIGatewayProxyEvent = {
      body: '{"id": "dummy_id_25", "quantity": 2}',
      pathParameters: {
        username: "username-string",
      },
    };

    const response = await removeProduct.run(data);

    expect(JSON.parse(response.statusCode)).to.be.equal(404);
    expect(JSON.parse(response.body).error).to.be.equal(
      "Product not found in the cart"
    );
  });

  it('cart removeProduct function - should be "Body missing"', async () => {
    const errorData: APIGatewayProxyEvent = {
      dummy: '{"name": 1, "description": 2}',
      pathParameters: {
        name: "dummy",
      },
    };

    const response = await removeProduct.run(errorData);
    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal("Body missing");
  });

  it('cart removeProduct function - should be "PathParameters missing"', async () => {
    const errorData: APIGatewayProxyEvent = {
      body: `{"id": "${IDProduct1}", quantity": 2}`,
    };

    const response = await removeProduct.run(errorData);
    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal(
      "PathParameters missing"
    );
  });

  it('cart toEmpty function - should be "PathParameters missing"', async () => {
    const data: APIGatewayProxyEvent = {
      dummy: {
        username: "username-string",
      },
    };

    const response = await toEmpty.run(data);
    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal(
      "PathParameters missing"
    );
  });

  it('cart toEmpty function - should be "Failed to empty the cart"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        username: 1,
      },
    };

    const response = await toEmpty.run(data);
    expect(JSON.parse(response.statusCode)).to.be.equal(502);
    expect(JSON.parse(response.body).error).to.be.equal(
      "Failed to empty the cart"
    );
  });

  it('cart toEmpty function - should be "Cart emptied"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        username: "username-string",
      },
    };

    const response = await toEmpty.run(data);
    expect(JSON.parse(response.statusCode)).to.be.equal(200);
    expect(JSON.parse(response.body).message).to.be.equal("Cart emptied");
  });

  it('cart delete function - should be "Cart deleted"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        username: "username-string",
      },
    };

    const response = await deleteFun.run(data);
    expect(JSON.parse(response.statusCode)).to.be.equal(200);
    expect(JSON.parse(response.body).message).to.be.equal("Cart deleted");
  });

  it('cart delete function - should be "PathParameters missing"', async () => {
    const data: APIGatewayProxyEvent = {
      dummy: {
        id: 45,
      },
    };

    const response = await deleteFun.run(data);
    expect(JSON.parse(response.statusCode)).to.be.equal(400);
    expect(JSON.parse(response.body).error).to.be.equal(
      "PathParameters missing"
    );
  });

  it('cart delete function - should be "Failed to delete the cart"', async () => {
    const data: APIGatewayProxyEvent = {
      pathParameters: {
        id: "dummy",
      },
    };

    const response = await deleteFun.run(data);
    expect(JSON.parse(response.statusCode)).to.be.equal(502);
    expect(JSON.parse(response.body).error).to.be.equal(
      "Failed to delete the cart"
    );
  });

  after(async () => {
    // functions
    const deleteProduct = mochaPlugin.getWrapper(
      "index",
      "/src/endpoints/product/delete.ts",
      "index"
    );

    const dataProduct1: APIGatewayProxyEvent = {
      pathParameters: {
        id: IDProduct1,
      },
    };

    const dataProduct2: APIGatewayProxyEvent = {
      pathParameters: {
        id: IDProduct2,
      },
    };

    await deleteProduct.run(dataProduct1);
    await deleteProduct.run(dataProduct2);
  });
});
