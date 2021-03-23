import { CognitoIdentityServiceProvider } from 'aws-sdk';

/*let userPoolId: string = process.env.USER_POOL_ID;
let region: string = process.env.AWS_REGION;

const CognitoService = new CognitoIdentityServiceProvider({
  endpoint: 'https://cognito-idp.' + region + '.amazonaws.com/' + userPoolId,
  region: region,
  apiVersion: '2016-04-18',
});*/

const CognitoService = new CognitoIdentityServiceProvider();

const Cognito = {
  /**
   * @param  {string} username: username of the user
   * @returns Promise
   */
  getUserAttributes: async (
    username: string
  ): Promise<CognitoIdentityServiceProvider.AttributeListType> => {
    const params: CognitoIdentityServiceProvider.AdminGetUserRequest = {
      Username: username,
      UserPoolId: process.env.USER_POOL_ID,
    };

    const data = await CognitoService.adminGetUser(params)
      .promise()
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw Error(`Error in Cognito adminGetUser: ` + err);
      });

    return data.UserAttributes ? data.UserAttributes : null;
  },

  /**
   * @param  {string} username: username of the user
   * @returns Promise
   */
  getUsername: async (username: string): Promise<string> => {
    const params: CognitoIdentityServiceProvider.AdminGetUserRequest = {
      Username: username,
      UserPoolId: process.env.USER_POOL_ID,
    };

    const data = await CognitoService.adminGetUser(params)
      .promise()
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw Error(`Error in Cognito adminGetUser: ` + err);
      });

    return data.Username ? data.Username : null;
  },

  /**
   * @param  {Map<name,value>} userAttributes: user attributes to update
   * @param  {string} username: username of the user
   * @returns Promise
   */
  updateUser: async (
    userAttributes: CognitoIdentityServiceProvider.AttributeListType,
    username: string
  ): Promise<CognitoIdentityServiceProvider.AdminUpdateUserAttributesResponse> => {
    const params: CognitoIdentityServiceProvider.AdminUpdateUserAttributesRequest = {
      UserAttributes: userAttributes,
      UserPoolId: process.env.USER_POOL_ID,
      Username: username,
    };

    return await CognitoService.adminUpdateUserAttributes(params)
      .promise()
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw Error(`Error in Cognito adminUpdateUserAttributes: ` + err);
      });
  },

  /**
   * @param  {string} username: username of the user
   * @returns Promise
   */
  deleteUser: async (username: string): Promise<{}> => {
    const params: CognitoIdentityServiceProvider.AdminDeleteUserRequest = {
      Username: username,
      UserPoolId: process.env.USER_POOL_ID,
    };

    return await CognitoService.adminDeleteUser(params)
      .promise()
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw Error(`Error in Cognito deleteUser: ` + err);
      });
  },
};

export default Cognito;
