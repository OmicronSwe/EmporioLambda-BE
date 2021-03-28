export interface DynamoFormat {
  Name: string;
  Value: string;
}

export default class User {
  email: string;

  name: string;

  family_name: string;

  address: string;

  username: string;

  constructor(
    email: string,
    name: string,
    family_name: string,
    address: string,
    username: string
  ) {
    this.email = email;
    this.name = name;
    this.family_name = family_name;
    this.address = address;
    this.username = username;
  }

  public getData(): object {
    return {
      email: this.email,
      name: this.name,
      family_name: this.family_name,
      address: this.address,
      username: this.username,
    };
  }

  public static fromDynamoFormat(body: DynamoFormat[]): User {
    let name;
    let family_name;
    let email;
    let address;
    let username;
    body.forEach((element) => {
      console.log(element);
      switch (element.Name) {
        case "name":
          name = element.Value;
          break;
        case "family_name":
          family_name = element.Value;
          break;
        case "email":
          email = element.Value;
          break;
        case "address":
          address = element.Value;
          break;
        case "sub":
          username = element.Value;
          break;
        default:
          break;
      }
    });
    return new User(email, name, family_name, address, username);
  }

  public toDynamoFormat(): DynamoFormat[] {
    const result: DynamoFormat[] = [
      {
        Name: "name",
        Value: this.name,
      },
      {
        Name: "family_name",
        Value: this.family_name,
      },
      {
        Name: "email",
        Value: this.email,
      },
      {
        Name: "address",
        Value: this.address,
      },
    ];

    return result;
  }
}
