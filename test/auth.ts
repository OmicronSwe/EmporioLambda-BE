import { APIGatewayProxyEvent } from "aws-lambda";

const mochaPlugin = require("serverless-mocha-plugin");

const expect = mochaPlugin.chai.expect;
const chaiAsPromised = require("chai-as-promised");

mochaPlugin.chai.use(chaiAsPromised);

const auth = mochaPlugin.getWrapper("auth", "/src/lib/auth.ts", "handler");

describe("Authentication", () => {
  it("Token unauthenticated user", async () => {
    const data: APIGatewayProxyEvent = {
      type: "TOKEN",
      authorizationToken: "dW5hdXRoZW50aWNhdGVk",
      methodArn:
        "arn:aws:execute-api:eu-central-1:123456789012:example/prod/POST/{proxy+}",
    };
    const response = JSON.stringify(await auth.run(data));
    expect(response).to.contain('{"principalId":"unauthorizedUser"');
  });
  it("No token supplied", async () => {
    const data: APIGatewayProxyEvent = {
      type: "TOKEN",
      methodArn:
        "arn:aws:execute-api:eu-central-1:123456789012:example/prod/POST/{proxy+}",
    };
    await expect(auth.run(data)).to.be.rejectedWith("NoToken");
  });
  it("Bad JWT supplied", async () => {
    const data: APIGatewayProxyEvent = {
      type: "TOKEN",
      authorizationToken: "definitelyNotAnAUTHToken",
      methodArn:
        "arn:aws:execute-api:eu-central-1:123456789012:example/prod/POST/{proxy+}",
    };
    await expect(auth.run(data)).to.be.rejectedWith("BadJWT");
  });

  // Some variables are missing. we can either setup a local mock server or not cover all cases.
  it("Bad Env", async () => {
    const data: APIGatewayProxyEvent = {
      type: "TOKEN",
      authorizationToken:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwiaXNzIjoic29tZVJhbmRvbUlTUyJ9.CoEACVnq2erGxs-q5dAAXMaMdJBRToKrRzb2uskiVdk",
      methodArn:
        "arn:aws:execute-api:eu-central-1:123456789012:example/prod/POST/{proxy+}",
    };
    await expect(auth.run(data)).to.be.rejectedWith("BadEnv");
  });
  it("Bad Token Type", async () => {
    const data: APIGatewayProxyEvent = {
      type: "TOKEN",
      authorizationToken:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidG9rZW5fdXNlIjoibm90QWNjZXNzIn0.53gu84szzJ0PArFDCtQ8veSFCkRi0VTNVQKdgMCqIvc",
      methodArn:
        "arn:aws:execute-api:eu-central-1:123456789012:example/prod/POST/{proxy+}",
    };
    await expect(auth.run(data)).to.be.rejectedWith("BadTokenType");
  });
});
