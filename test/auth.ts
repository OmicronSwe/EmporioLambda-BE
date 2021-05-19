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
    nock("https://cognito-idp.undefined.amazonaws.com")
      .get("//.well-known/jwks.json")
      .reply(200, {
        keys: [
          {
            alg: "RS256",
            e: "AQAB",
            kid: "z7LZg5m4RVQxMkvLX5r8a3kMauxoSWOp5XCOYlqkFok=",
            kty: "RSA",
            n: "1elNJjnW94MulJi1hjd_P8Y2jADoJDU5qNsz7Fj0soY0D7LSjsCCHiY_A34BYP0wkEO1GykG4AdGZkV86CGinCiShVsc4fIW6S2x_BdnNt7nb09IT3ftt1CXCGiOfNhwS9Ld0P8FuDXDHnCPWhcis-81q0GGazAVLsRt8zMp7XjOPRGdfbxCz-TmeVSgMg2WS1QOZl-D4cJbvnoUPCCOeVBK3okSRQOqLqP3NAVwabnazQVd7yBqA3nuL9wjk0KRF7y9UOdrSHFM4aW2jmjf_OOFzwWs6hNp7x7IooZvTKrYaABjAM7szh97nC9-ZLWA9JKSApL37QuYzlR7cV-iBQ",
            use: "sig",
          },
          {
            kty: "RSA",
            kid: "fVHIN_NtKKBMDIFh6Z79PshJ7ClOFW3JNTNNYH228Ik",
            use: "sig",
            alg: "RS256",
            e: "AQAB",
            n: "sVFA1ArpDhSPtjiT8KPJgmm67vfb9LP4bYFUx-7MI4It3pBKPEcgNSLRpXCGRF-4KWYCB9idrAFJ-_SQQwiLKw",
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
  it("Token authenticated user", async () => {
    const data: APIGatewayProxyEvent = {
      type: "TOKEN",
      authorizationToken:
        "eyJhbGciOiJSUzI1NiIsImtpZCI6ImZWSElOX050S0tCTURJRmg2Wjc5UHNoSjdDbE9GVzNKTlROTllIMjI4SWsifQ.eyJzdWIiOiIzMTg0YTE0My01NThmLTQ0NjEtOWI5MS1kMDA0NzAzN2E1M2IiLCJpc3MiOiJodHRwczovL2NvZ25pdG8taWRwLnVuZGVmaW5lZC5hbWF6b25hd3MuY29tLyIsInZlcnNpb24iOjIsImNsaWVudF9pZCI6ImVkZXVkdGtncW5oNHRiN2c4bGJuczJmYjUiLCJldmVudF9pZCI6ImY4NzQwYWZhLTJlYTUtNDNhNS05Y2YzLWExNTllNGZkNTZhOCIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJqdGkiOiJjMTUzZjhlZS0yZDE4LTRjNmYtYTNmOS02ZDE2ZjIyMzUwOTIiLCJ1c2VybmFtZSI6IjMxODRhMTQzLTU1OGYtNDQ2MS05YjkxLWQwMDQ3MDM3YTUzYiJ9.OV-MkSISmPZVcQQJJHP0BHdkiW8ZMbgLv51sSsNpfxHH8XbN3qC75BsAuE5NL6C33_CSKR8ERpuPBnMh7Qph3A",
      methodArn:
        "arn:aws:execute-api:eu-central-1:123456789012:example/prod/POST/{proxy+}",
    };
    const response = JSON.stringify(await auth.run(data));
    expect(response).to.contain(
      '{"principalId":"3184a143-558f-4461-9b91-d0047037a53b"'
    );
  });
  it("Token admin user", async () => {
    const data: APIGatewayProxyEvent = {
      type: "TOKEN",
      authorizationToken:
        "eyJhbGciOiJSUzI1NiIsImtpZCI6ImZWSElOX050S0tCTURJRmg2Wjc5UHNoSjdDbE9GVzNKTlROTllIMjI4SWsifQ.eyJzdWIiOiIzMTg0YTE0My01NThmLTQ0NjEtOWI5MS1kMDA0NzAzN2E1M2EiLCJjb2duaXRvOmdyb3VwcyI6WyJWZW5kaXRvcmVBZG1pbiJdLCJpc3MiOiJodHRwczovL2NvZ25pdG8taWRwLnVuZGVmaW5lZC5hbWF6b25hd3MuY29tLyIsInZlcnNpb24iOjIsImNsaWVudF9pZCI6ImVkZXVkdGtncW5oNHRiN2c4bGJuczJmYjUiLCJldmVudF9pZCI6ImY4NzQwYWZhLTJlYTUtNDNhNS05Y2YzLWExNTllNGZkNTZhOCIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJqdGkiOiJjMTUzZjhlZS0yZDE4LTRjNmYtYTNmOS02ZDE2ZjIyMzUwOTIiLCJ1c2VybmFtZSI6IjMxODRhMTQzLTU1OGYtNDQ2MS05YjkxLWQwMDQ3MDM3YTUzYSJ9.gl__sZkieOpdeb5C79QJYkmhS2YlEqt2WyiTkXWcylLd2woKFlk02IDD4MUudRpMVscCyzKKWLhw5IapODUHTQ",
      methodArn:
        "arn:aws:execute-api:eu-central-1:123456789012:example/prod/POST/{proxy+}",
    };
    const response = JSON.stringify(await auth.run(data));
    expect(response).to.contain(
      '"Resource":["arn:aws:execute-api:eu-central-1:123456789012:example/prod/*/*"]'
    );
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
        "eyJhbGciOiJIUzI1NiIsImtpZCI6ImhpZSIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwiaXNzIjoiaHR0cHM6Ly9jb2duaXRvLWlkcC51bmRlZmluZWQuYW1hem9uYXdzLmNvbS8ifQ.VkP3-_GAbXQZWiaQ0w7UHQnA6w9SJ8WAivF-zqFCNC4",
      methodArn:
        "arn:aws:execute-api:eu-central-1:123456789012:example/prod/POST/{proxy+}",
    };
    await expect(auth.run(data)).to.be.rejectedWith("InvalidToken");
  });
  it("Expired Token", async () => {
    const data: APIGatewayProxyEvent = {
      type: "TOKEN",
      authorizationToken:
        "eyJhbGciOiJSUzI1NiIsImtpZCI6ImZWSElOX050S0tCTURJRmg2Wjc5UHNoSjdDbE9GVzNKTlROTllIMjI4SWsifQ.eyJzdWIiOiIzMTg0YTE0My01NThmLTQ0NjEtOWI5MS1kMDA0NzAzN2E1M2IiLCJpc3MiOiJodHRwczovL2NvZ25pdG8taWRwLnVuZGVmaW5lZC5hbWF6b25hd3MuY29tLyIsInZlcnNpb24iOjIsImNsaWVudF9pZCI6ImVkZXVkdGtncW5oNHRiN2c4bGJuczJmYjUiLCJldmVudF9pZCI6ImY4NzQwYWZhLTJlYTUtNDNhNS05Y2YzLWExNTllNGZkNTZhOCIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJhdXRoX3RpbWUiOjE2MTY1OTQwMzUsImV4cCI6MTYxNjU5NzYzNSwiaWF0IjoxNjE2NTk0MDM1LCJqdGkiOiJjMTUzZjhlZS0yZDE4LTRjNmYtYTNmOS02ZDE2ZjIyMzUwOTIiLCJ1c2VybmFtZSI6IjMxODRhMTQzLTU1OGYtNDQ2MS05YjkxLWQwMDQ3MDM3YTUzYiJ9.qgQQZgQ26OG-sG4yDCxN9XvaOiVxKwq-ZUibUlhrA1DAtPmHFto5MK7GgfQLNnWAg77sVbqyVNko_bZVfBvOzw",
      methodArn:
        "arn:aws:execute-api:eu-central-1:123456789012:example/prod/POST/{proxy+}",
    };
    await expect(auth.run(data)).to.be.rejectedWith("ExpiredToken");
  });
});
