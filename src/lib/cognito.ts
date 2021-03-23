import { CognitoIdentityServiceProvider } from 'aws-sdk';

let userPoolId: string = process.env.USER_POOL_ID;
let region: string = process.env.AWS_REGION;

const CognitoService = new CognitoIdentityServiceProvider({
  endpoint: 'https://cognito-idp.' + region + '.amazonaws.com/' + userPoolId,
  region: region,
  apiVersion: '2016-04-18',
});

const Cognito = {
  /**
   * @param  {string} accessToken: user access token
   * @returns Promise
   */
  getUserAttributes: async (
    accessToken: string
  ): Promise<CognitoIdentityServiceProvider.AttributeListType> => {
    console.log(accessToken);

    const params: CognitoIdentityServiceProvider.GetUserRequest = {
      AccessToken: accessToken,
    };

    const data = await CognitoService.getUser(params)
      .promise()
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw Error(`Error in Cognito getUser: ` + err);
      });

    console.log(data);

    return data.UserAttributes ? data.UserAttributes : null;
  },

  getUsername: async (accessToken: string): Promise<string> => {
    const params: CognitoIdentityServiceProvider.GetUserRequest = {
      AccessToken: accessToken,
    };

    const data = await CognitoService.getUser(params)
      .promise()
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw Error(`Error in Cognito getUser: ` + err);
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
      UserPoolId: process.env.NAMESPACE + '-EML-user_pool',
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

  deleteUser: async (accessToken: string): Promise<{}> => {
    const params: CognitoIdentityServiceProvider.DeleteUserRequest = {
      AccessToken: accessToken,
    };

    return await CognitoService.deleteUser()
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
