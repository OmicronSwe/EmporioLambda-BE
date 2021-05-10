import { APIGatewayProxyEvent } from "aws-lambda";

const nock = require("nock");
const mochaPlugin = require("serverless-mocha-plugin");

const expect = mochaPlugin.chai.expect;
const chaiAsPromised = require("chai-as-promised");

mochaPlugin.chai.use(chaiAsPromised);

const auth = mochaPlugin.getWrapper("auth", "/src/lib/auth.ts", "handler");

describe("Authentication1 no jwk", () => {
  it("JWK Download failed", async () => {
    const data: APIGatewayProxyEvent = {
      type: "TOKEN",
      authorizationToken:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwiaXNzIjoic29tZVJhbmRvbUlTUyJ9.CoEACVnq2erGxs-q5dAAXMaMdJBRToKrRzb2uskiVdk",
      methodArn:
        "arn:aws:execute-api:eu-central-1:123456789012:example/prod/POST/{proxy+}",
    };
    await expect(auth.run(data)).to.be.rejectedWith("JWKDownloadFail");
  });
});

describe("Authentication2 mock jwk", () => {
  before(() => {
    nock("https://cognito-idp.test.amazonaws.com")
      .get("//.well-known/jwks.json")
      .reply(200, {
        keys: [
          {
            alg: "RS256",
            e: "AQAB",
            kid: "z7LZg5m4RVQxMkvLX5r8a3kMauxoSWOp5XCOYlqkFok=",
            kty: "RSA",
            n:
              "1elNJjnW94MulJi1hjd_P8Y2jADoJDU5qNsz7Fj0soY0D7LSjsCCHiY_A34BYP0wkEO1GykG4AdGZkV86CGinCiShVsc4fIW6S2x_BdnNt7nb09IT3ftt1CXCGiOfNhwS9Ld0P8FuDXDHnCPWhcis-81q0GGazAVLsRt8zMp7XjOPRGdfbxCz-TmeVSgMg2WS1QOZl-D4cJbvnoUPCCOeVBK3okSRQOqLqP3NAVwabnazQVd7yBqA3nuL9wjk0KRF7y9UOdrSHFM4aW2jmjf_OOFzwWs6hNp7x7IooZvTKrYaABjAM7szh97nC9-ZLWA9JKSApL37QuYzlR7cV-iBQ",
            use: "sig",
          },
          {
            alg: "RS256",
            e: "AQAB",
            kid: "QQzr1w9bcgDE03oOh61Y8pczTtkUK8Q5paJFBNw3424=",
            kty: "RSA",
            n:
              "tCNz6RoIyCYEK699qBp5vQF5Qfqs60JDwMwONyca_YKzUK1Wpw0RHiF7Xpz1fXrVrQZ-Qp0k2_f5tPCyg2lFxs2WN1HX8UcObBjr_PrjTAZeKplWR7VOcCc5PIvubxnp067OrWUn9yABwH7hfzWz31gEqyxohsRnqWmMyNbGTfdaeMAGVUIAKQYetIraJO_-78w75R9uoJlPOnfZ-x25kiGuqURuwSSLGcboFxxxWgC5BYYVwFdGMVJxrsii7JKJ_H3BBPDQnxOGiJk4ERiD_ZrxXZ9dkXoSeusVwdNwTRD0sLIX3ywmBssRFw0N6R5GLQlby-yEEqrFehlm73f9DQ",
            use: "sig",
          },
        ],
      });
  });

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

  it("Bad Iss", async () => {
    const data: APIGatewayProxyEvent = {
      type: "TOKEN",
      authorizationToken:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwiaXNzIjoibm90QVZhbGlkSVNTIn0.1-jE_G6qz-fBB6N-b9fILm3aJ_o3CeN5Sqk6Bq-sDzQ",
      methodArn:
        "arn:aws:execute-api:eu-central-1:123456789012:example/prod/POST/{proxy+}",
    };
    await expect(auth.run(data)).to.be.rejectedWith("BadIss");
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

  it("Invalid Kid", async () => {
    const data: APIGatewayProxyEvent = {
      type: "TOKEN",
      authorizationToken:
        "eyJhbGciOiJIUzI1NiIsImtpZCI6ImhpZSIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwiaXNzIjoiaHR0cHM6Ly9jb2duaXRvLWlkcC50ZXN0LmFtYXpvbmF3cy5jb20vIn0.wHk8DCGjyyo--ORGi1PWuHWloSQK8AmY_TN7Wt4Tzhs",
      methodArn:
        "arn:aws:execute-api:eu-central-1:123456789012:example/prod/POST/{proxy+}",
    };
    await expect(auth.run(data)).to.be.rejectedWith("InvalidToken");
  });
});
