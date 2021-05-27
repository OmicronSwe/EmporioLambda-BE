import { CognitoIdentityServiceProvider } from "aws-sdk";

const CognitoService = new CognitoIdentityServiceProvider();

const Cognito = {
  /**
   * @param  {string} username: username of the user
   * @returns Promise
   */
  getUserAttributes: (
    username: string
  ): Promise<CognitoIdentityServiceProvider.AttributeListType> => {
    const params: CognitoIdentityServiceProvider.AdminGetUserRequest = {
      Username: username,
      UserPoolId: process.env.USER_POOL_ID,
    };

    return CognitoService.adminGetUser(params)
      .promise()
      .then((data) => {
        return data.UserAttributes ? data.UserAttributes : null;
      })
      .catch((err) => {
        throw Error(`Error in Cognito adminGetUser: ${err}`);
      });
  },

  /**
   * @param  {string} username: username of the user
   * @returns Promise
   */
  getUsername: (username: string): Promise<string> => {
    const params: CognitoIdentityServiceProvider.AdminGetUserRequest = {
      Username: username,
      UserPoolId: process.env.USER_POOL_ID,
    };

    return CognitoService.adminGetUser(params)
      .promise()
      .then((data) => {
        return data.Username ? data.Username : null;
      })
      .catch((err) => {
        throw Error(`Error in Cognito adminGetUser: ${err}`);
      });
  },

  /**
   * @param  {Map<name,value>} userAttributes: user attributes to update
   * @param  {string} username: username of the user
   * @returns Promise
   */
  updateUser: (
    userAttributes: CognitoIdentityServiceProvider.AttributeListType,
    username: string
  ): Promise<CognitoIdentityServiceProvider.AdminUpdateUserAttributesResponse> => {
    const params: CognitoIdentityServiceProvider.AdminUpdateUserAttributesRequest =
      {
        UserAttributes: userAttributes,
        UserPoolId: process.env.USER_POOL_ID,
        Username: username,
      };

    return CognitoService.adminUpdateUserAttributes(params)
      .promise()
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw Error(`Error in Cognito adminUpdateUserAttributes: ${err}`);
      });
  },

  updateUserPassword: (
    password: string,
    username: string
  ): Promise<CognitoIdentityServiceProvider.AdminSetUserPasswordResponse> => {
    const params: CognitoIdentityServiceProvider.AdminSetUserPasswordRequest = {
      UserPoolId: process.env.USER_POOL_ID,
      Username: username,
      Password: password,
      Permanent: true,
    };

    return CognitoService.adminSetUserPassword(params)
      .promise()
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw Error(`Error in Cognito adminUpdateUserAttributes: ${err}`);
      });
  },

  /**
   * @param  {string} username: username of the user
   * @returns Promise
   */
  deleteUser: (username: string): Promise<{}> => {
    const params: CognitoIdentityServiceProvider.AdminDeleteUserRequest = {
      Username: username,
      UserPoolId: process.env.USER_POOL_ID,
    };

    return CognitoService.adminDeleteUser(params)
      .promise()
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw Error(`Error in Cognito deleteUser: ${err}`);
      });
  },
};

export default Cognito;
