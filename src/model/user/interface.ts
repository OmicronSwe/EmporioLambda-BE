export interface CognitoFormat {
  Name: string;
  Value: string;
}

export interface UserCognito {
  readonly email: string;
  readonly name: string;
  readonly family_name: string;
  readonly address: string;
  readonly username: string;
}
