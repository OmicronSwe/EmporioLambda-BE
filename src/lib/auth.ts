import jwt = require("jsonwebtoken");
import https = require("https");
import jwkToPem = require("jwk-to-pem");

const userPoolId: string =
  process.env.USER_POOL_ID == "[object Object]" ? "" : process.env.USER_POOL_ID;
const region: string = process.env.AWS_REGION;

let pems;
const iss: string = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;

function AuthPolicy(principal, awsAccountId, apiOptions) {
  /**
   * The AWS account id the policy will be generated for. This is used to create
   * the method ARNs.
   *
   * @property awsAccountId
   * @type {String}
   */
  this.awsAccountId = awsAccountId;

  /**
   * The principal used for the policy, this should be a unique identifier for
   * the end user.
   *
   * @property principalId
   * @type {String}
   */
  this.principalId = principal;

  /**
   * The policy version used for the evaluation. This should always be "2012-10-17"
   *
   * @property version
   * @type {String}
   * @default "2012-10-17"
   */
  this.version = "2012-10-17";

  /**
   * The regular expression used to validate resource paths for the policy
   *
   * @property pathRegex
   * @type {RegExp}
   * @default '^\/[/.a-zA-Z0-9-\*]+$'
   */
  this.pathRegex = new RegExp("^[/.a-zA-Z0-9-*]+$");

  // these are the internal lists of allowed and denied methods. These are lists
  // of objects and each object has 2 properties: A resource ARN and a nullable
  // conditions statement.
  // the build method processes these lists and generates the approriate
  // statements for the final policy
  this.allowMethods = [];
  this.denyMethods = [];

  if (!apiOptions || !apiOptions.restApiId) {
    this.restApiId = "*";
  } else {
    this.restApiId = apiOptions.restApiId;
  }
  if (!apiOptions || !apiOptions.region) {
    this.region = "*";
  } else {
    this.region = apiOptions.region;
  }
  if (!apiOptions || !apiOptions.stage) {
    this.stage = "*";
  } else {
    this.stage = apiOptions.stage;
  }
}

/**
 * A set of existing HTTP verbs supported by API Gateway. This property is here
 * only to avoid spelling mistakes in the policy.
 *
 * @property HttpVerb
 * @type {Object}
 */
AuthPolicy.HttpVerb = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  HEAD: "HEAD",
  DELETE: "DELETE",
  OPTIONS: "OPTIONS",
  ALL: "*",
};

AuthPolicy.prototype = (() => {
  /**
   * Adds a method to the internal lists of allowed or denied methods. Each object in
   * the internal list contains a resource ARN and a condition statement. The condition
   * statement can be null.
   *
   * @method addMethod
   * @param {String} The effect for the policy. This can only be "Allow" or "Deny".
   * @param {String} he HTTP verb for the method, this should ideally come from the
   *                 AuthPolicy.HttpVerb object to avoid spelling mistakes
   * @param {String} The resource path. For example "/pets"
   * @param {Object} The conditions object in the format specified by the AWS docs.
   * @return {void}
   */
  const addMethod = function addMethod(effect, verb, resource, conditions) {
    if (
      verb != "*" &&
      !Object.prototype.hasOwnProperty.call(AuthPolicy.HttpVerb, verb)
    ) {
      throw new Error(
        `Invalid HTTP verb ${verb}. Allowed verbs in AuthPolicy.HttpVerb`
      );
    }

    if (!this.pathRegex.test(resource)) {
      throw new Error(
        `Invalid resource path: ${resource}. Path should match ${this.pathRegex}`
      );
    }

    let cleanedResource = resource;
    if (resource.substring(0, 1) == "/") {
      cleanedResource = resource.substring(1, resource.length);
    }
    const resourceArn = `arn:aws:execute-api:${this.region}:${this.awsAccountId}:${this.restApiId}/${this.stage}/${verb}/${cleanedResource}`;

    if (effect.toLowerCase() == "allow") {
      this.allowMethods.push({
        resourceArn,
        conditions,
      });
    } else if (effect.toLowerCase() == "deny") {
      this.denyMethods.push({
        resourceArn,
        conditions,
      });
    }
  };

  /**
   * Returns an empty statement object prepopulated with the correct action and the
   * desired effect.
   *
   * @method getEmptyStatement
   * @param {String} The effect of the statement, this can be "Allow" or "Deny"
   * @return {Object} An empty statement object with the Action, Effect, and Resource
   *                  properties prepopulated.
   */
  const getEmptyStatement = function getEmptyStatement(effect) {
    const statement: any = {};
    statement.Action = "execute-api:Invoke";
    statement.Effect =
      effect.substring(0, 1).toUpperCase() +
      effect.substring(1, effect.length).toLowerCase();
    statement.Resource = [];

    return statement;
  };

  /**
   * This function loops over an array of objects containing a resourceArn and
   * conditions statement and generates the array of statements for the policy.
   *
   * @method getStatementsForEffect
   * @param {String} The desired effect. This can be "Allow" or "Deny"
   * @param {Array} An array of method objects containing the ARN of the resource
   *                and the conditions for the policy
   * @return {Array} an array of formatted statements for the policy.
   */
  const getStatementsForEffect = function getStatementsForEffect(
    effect,
    methods
  ) {
    const statements: any[] = [];

    if (methods.length > 0) {
      const statement = getEmptyStatement(effect);

      for (let i = 0; i < methods.length; i++) {
        const curMethod = methods[i];
        if (
          curMethod.conditions === null ||
          curMethod.conditions.length === 0
        ) {
          statement.Resource.push(curMethod.resourceArn);
        } else {
          const conditionalStatement = getEmptyStatement(effect);
          conditionalStatement.Resource.push(curMethod.resourceArn);
          conditionalStatement.Condition = curMethod.conditions;
          statements.push(conditionalStatement);
        }
      }

      if (statement.Resource !== null && statement.Resource.length > 0) {
        statements.push(statement);
      }
    }

    return statements;
  };

  return {
    constructor: AuthPolicy,

    /**
     * Adds an allow "*" statement to the policy.
     *
     * @method allowAllMethods
     */
    allowAllMethods() {
      addMethod.call(this, "allow", "*", "*", null);
    },

    /**
     * Adds a deny "*" statement to the policy.
     *
     * @method denyAllMethods
     */
    denyAllMethods() {
      addMethod.call(this, "deny", "*", "*", null);
    },

    /**
     * Adds an API Gateway method (Http verb + Resource path) to the list of allowed
     * methods for the policy
     *
     * @method allowMethod
     * @param {String} The HTTP verb for the method, this should ideally come from the
     *                 AuthPolicy.HttpVerb object to avoid spelling mistakes
     * @param {string} The resource path. For example "/pets"
     * @return {void}
     */
    allowMethod(verb, resource) {
      addMethod.call(this, "allow", verb, resource, null);
    },

    /**
     * Adds an API Gateway method (Http verb + Resource path) to the list of denied
     * methods for the policy
     *
     * @method denyMethod
     * @param {String} The HTTP verb for the method, this should ideally come from the
     *                 AuthPolicy.HttpVerb object to avoid spelling mistakes
     * @param {string} The resource path. For example "/pets"
     * @return {void}
     */
    denyMethod(verb, resource) {
      addMethod.call(this, "deny", verb, resource, null);
    },

    /**
     * Adds an API Gateway method (Http verb + Resource path) to the list of allowed
     * methods and includes a condition for the policy statement. More on AWS policy
     * conditions here: http://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements.html#Condition
     *
     * @method allowMethodWithConditions
     * @param {String} The HTTP verb for the method, this should ideally come from the
     *                 AuthPolicy.HttpVerb object to avoid spelling mistakes
     * @param {string} The resource path. For example "/pets"
     * @param {Object} The conditions object in the format specified by the AWS docs
     * @return {void}
     */
    allowMethodWithConditions(verb, resource, conditions) {
      addMethod.call(this, "allow", verb, resource, conditions);
    },

    /**
     * Adds an API Gateway method (Http verb + Resource path) to the list of denied
     * methods and includes a condition for the policy statement. More on AWS policy
     * conditions here: http://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements.html#Condition
     *
     * @method denyMethodWithConditions
     * @param {String} The HTTP verb for the method, this should ideally come from the
     *                 AuthPolicy.HttpVerb object to avoid spelling mistakes
     * @param {string} The resource path. For example "/pets"
     * @param {Object} The conditions object in the format specified by the AWS docs
     * @return {void}
     */
    denyMethodWithConditions(verb, resource, conditions) {
      addMethod.call(this, "deny", verb, resource, conditions);
    },

    /**
     * Generates the policy document based on the internal lists of allowed and denied
     * conditions. This will generate a policy with two main statements for the effect:
     * one statement for Allow and one statement for Deny.
     * Methods that includes conditions will have their own statement in the policy.
     *
     * @method build
     * @return {Object} The policy object that can be serialized to JSON.
     */
    build() {
      if (
        (!this.allowMethods || this.allowMethods.length === 0) &&
        (!this.denyMethods || this.denyMethods.length === 0)
      ) {
        throw new Error("No statements defined for the policy");
      }

      const policy: any = {};
      policy.principalId = this.principalId;
      const doc: any = {};
      doc.Version = this.version;
      doc.Statement = [];

      doc.Statement = doc.Statement.concat(
        getStatementsForEffect.call(this, "Allow", this.allowMethods)
      );
      doc.Statement = doc.Statement.concat(
        getStatementsForEffect.call(this, "Deny", this.denyMethods)
      );

      policy.policyDocument = doc;

      return policy;
    },
  };
})();

function ValidateToken(pems, event, context) {
  if (!event.authorizationToken) {
    context.fail("NoToken");
    return;
  }
  const token = event.authorizationToken;
  let principalId;
  let decodedJwt;

  if (token != "dW5hdXRoZW50aWNhdGVk") {
    // Fail if the token is not jwt
    decodedJwt = jwt.decode(token, { complete: true });
    if (!decodedJwt) {
      context.fail("BadJWT");
      return;
    }

    // Reject the jwt if it's not an 'Access Token'
    if (decodedJwt.payload.token_use != "access") {
      context.fail("BadTokenType");
      return;
    }

    // Fail if token is not from your UserPool
    if (decodedJwt.payload.iss != iss) {
      context.fail("BadIss");
      return;
    }

    // Get the kid from the token and retrieve corresponding PEM
    const kid = decodedJwt.header.kid;
    const pem = pems[kid];

    if (!pem) {
      context.fail("InvalidToken");
      return;
    }

    // Verify the signature of the JWT token to ensure it's really coming from your User Pool
    jwt.verify(token, pem, { issuer: iss }, (err) => {
      if (err) {
        context.fail("ExpiredToken");
      }
    });
    principalId = decodedJwt.payload.sub;
  } else {
    principalId = "unauthorizedUser";
  }

  // Get AWS AccountId and API Options
  const apiOptions: any = {};
  const tmp = event.methodArn.split(":");
  const apiGatewayArnTmp = tmp[5].split("/");
  const awsAccountId = tmp[4];
  apiOptions.region = tmp[3];
  apiOptions.restApiId = apiGatewayArnTmp[0];
  apiOptions.stage = apiGatewayArnTmp[1];
  // For more information on specifics of generating policy, refer to blueprint for API Gateway's Custom authorizer in Lambda console
  const policy = new AuthPolicy(principalId, awsAccountId, apiOptions);

  // API Visibility

  if (decodedJwt && decodedJwt.payload["cognito:groups"] == "VenditoreAdmin") {
    policy.allowAllMethods();
  } else {
    if (principalId != "unauthorizedUser") {
      // API Accessible only to authorized users
      // PROFILE
      policy.allowMethod("*", `/user/${decodedJwt.payload.sub}/*`);
      // ORDERS
      policy.allowMethod("POST", "/order");
      policy.allowMethod(
        "GET",
        `/order/getByUsername/${decodedJwt.payload.sub}`
      );
      policy.allowMethod(
        "GET",
        `/order/getByUsername/${decodedJwt.payload.sub}/*`
      );
      // CART
      policy.allowMethod("POST", "/cart");
      policy.allowMethod("*", `/cart/${decodedJwt.payload.sub}`);
      policy.allowMethod(
        "PUT",
        `/cart/removeProduct/${decodedJwt.payload.sub}`
      );
      policy.allowMethod("PUT", `/cart/addProduct/${decodedJwt.payload.sub}`);
      policy.allowMethod("PUT", `/cart/toEmpty/${decodedJwt.payload.sub}`);
    }
    // API Accessible to all users
    policy.allowMethod("GET", "/product");
    policy.allowMethod("GET", "/product/*");
    policy.allowMethod("GET", "/category");
    policy.allowMethod("GET", "/category/*");
    policy.allowMethod("GET", "/tax/*");
  }
  context.succeed(policy.build());
}

exports.handler = (event, context) => {
  if (!pems) {
    // Download the JWKs and save it as PEM
    const options: https.RequestOptions = {
      host: `cognito-idp.${region}.amazonaws.com`,
      path: `/${userPoolId}/.well-known/jwks.json`,
    };
    https
      .get(options, (response) => {
        if (response.statusCode === 200) {
          pems = {};
          let data = "";
          response.setEncoding("utf8");
          response
            .on("data", (chunk) => {
              data += chunk;
            })
            .on("end", () => {
              const json = JSON.parse(data);
              const keys = json.keys;
              for (let i = 0; i < keys.length; i++) {
                // Convert each key to PEM
                const keyId = keys[i].kid;
                const modulus = keys[i].n;
                const exponent = keys[i].e;
                const keyType = keys[i].kty;
                const jwk = { kty: keyType, n: modulus, e: exponent };
                const pem = jwkToPem(jwk);
                pems[keyId] = pem;
              }
              ValidateToken(pems, event, context);
            });
        } else {
          // Unable to download JWKs, fail the call
          context.fail("JWKDownloadFail");
        }
      })
      .on("error", () => {
        // Unable to download JWKs, fail the call
        context.fail("JWKDownloadFail");
      });
  } else {
    // PEMs are already downloaded, continue with validating the token
    ValidateToken(pems, event, context);
  }
};
