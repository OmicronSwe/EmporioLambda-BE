import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

const Dynamo = {
  /*async get(ID :string, TableName: string): Promise<object> {
        const params = {
            TableName,
            Key: {
                ID,
            },
        };

        const data = await dynamoDb.get(params).promise();

        if (!data || !data.Item) {
            throw Error(`There was an error fetching the data for ID of ${ID} from ${TableName}`);
        }
        console.log(data);

        return data.Item;
    },*/

  async write(data, TableName: string): Promise<object> {
    if (!data.id) {
      throw Error('no ID on the data');
    }

    const params = {
      TableName,
      Item: data,
    };

    const res = await dynamoDb.put(params).promise();

    if (!res) {
      throw Error(`There was an error inserting ID of ${data.id} in table ${TableName}`);
    }

    return data;
  },

  /*async update({ tableName, primaryKey, primaryKeyValue, updateKey, updateValue }) {
        

        updateKey.forEach(element => {
            
        });
        const params = {
            TableName: tableName,
            Key: { [primaryKey]: primaryKeyValue },
            ExpressionAttributeNames: {
                '#product_name': 'name',
            },
            UpdateExpression: `set ${updateKey} = :updateValue`,
            ExpressionAttributeValues: {
                ':updateValue': updateValue,
            },
        };

        return dynamoDb.update(params).promise();
    },

    query: async ({ tableName, index, queryKey, queryValue }) => {
        const params = {
            TableName: tableName,
            IndexName: index,
            KeyConditionExpression: `${queryKey} = :hkey`,
            ExpressionAttributeValues: {
                ':hkey': queryValue,
            },
        };

        const res = await documentClient.query(params).promise();

        return res.Items || [];
    },

    scan: async ({ tableName, filterExpression, expressionAttributes }) => {
        const params = {
            TableName: tableName,
            FilterExpression: filterExpression,
            ExpressionAttributeValues: expressionAttributes,
        };
        const res = await documentClient.scan(params).promise();

        return res.Items || [];
    },*/
};
export default Dynamo;
