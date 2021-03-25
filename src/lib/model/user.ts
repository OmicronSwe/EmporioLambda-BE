export interface DynamoFormat {
        Name: string;
        Value: string;  
    }


export default class User {
    email: string;
    name: string;
    family_name: string;
    address: string;
  
    constructor(email: string, name: string, family_name: string, address: string){
        this.email = email
        this.name = name
        this.family_name = family_name
        this.address = address
    } 
  
    public getData(): object {
      return {
        email: this.email,
        name: this.name,
        family_name: this.family_name,
        address: this.address,
      };
    }

    public static fromDynamoFormat(body: DynamoFormat[]): User {
        let name, family_name, email, address
            body.forEach(element => {
                console.log(element)
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
                    default:
                        break;
                }
            });
        return new User(email, name, family_name, address)
    }

    public toDynamoFormat(): DynamoFormat[] {
        let result: DynamoFormat[] = [{
                Name: "name",
                Value: this.name
            },
            {
                Name: "family_name",
                Value: this.family_name
            },
            {
                Name: "email",
                Value: this.email
            },
            {
                Name: "address",
                Value: this.address
            }]

        return result
    }
}
  