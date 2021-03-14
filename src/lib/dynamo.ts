import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

const Dynamo = {
  get: async (id: string, TableName: string): Promise<DynamoDB.AttributeMap> => {
    const params = {
      TableName,
      Key: {
        id,
      },
    };

    const data = await dynamoDb.get(params).promise();

    if (!data || !data.Item) {
      throw Error(`There was an error fetching the data for ID of ${id} from ${TableName}`);
    }

    //console.log(data);

    return data.Item;
  },

  write: async (data, TableName: string): Promise<object> => {
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

  update: async (
    tableName: string,
    primaryKey: string,
    primaryKeyValue: string,
    updateKey: Array<string>,
    updateValue: Array<string>
  ): Promise<DynamoDB.UpdateItemOutput> => {
    if (updateKey.length != updateValue.length) {
      throw Error('Key element and value element must have the same number element');
    }

    let updateExpr: string = 'SET ';
    let AttriNameExpr: { [k: string]: string } = {};
    let AttriValueExpr: { [k: string]: any } = {};

    //create string for update
    for (let index = 0; index < updateKey.length; index++) {
      updateExpr += '#element' + index + ' = :Value' + index + ',';
    }

    updateExpr = updateExpr.slice(0, -1);

    //create key and value element for update
    updateKey.forEach((element, index) => {
      AttriNameExpr['#element' + index] = element;
      AttriValueExpr[':Value' + index] = updateValue[index];
    });

    const params = {
      TableName: tableName,
      Key: { [primaryKey]: primaryKeyValue },
      ExpressionAttributeNames: AttriNameExpr,
      UpdateExpression: updateExpr,
      ExpressionAttributeValues: AttriValueExpr,
    };

    return dynamoDb
      .update(params)
      .promise()
      .then(function (data) {
        return data;
      })
      .catch(function (err) {
        throw Error(err);
      });
  },

  query: async (
    tableName: string,
    index: string,
    Key: Array<string>,
    Value: Array<string>,
    queryCondition: string
  ): Promise<DynamoDB.ItemList> => {
    let AttriNameExpr: { [k: string]: string } = {};
    let AttriValueExpr: { [k: string]: any } = {};

    //create key and value element for query
    Key.forEach((element, index) => {
      AttriNameExpr['#element' + index] = element;
      AttriValueExpr[':Value' + index] = Value[index];
    });

    const params = {
      TableName: tableName,
      IndexName: index,
      ExpressionAttributeNames: AttriNameExpr,
      KeyConditionExpression: queryCondition,
      ExpressionAttributeValues: AttriValueExpr,
    };

    console.log(params);

    const res = await dynamoDb.query(params).promise();

    return res.Items || [];
  },

  scan: async (
    tableName: string,
    filterExpression: string = '',
    Value: Array<string> = []
  ): Promise<DynamoDB.ItemList> => {
    //create key and value element for query
    let AttriValueExpr: { [k: string]: any } = {};

    Value.forEach((element, index) => {
      AttriValueExpr[':Value' + index] = element;
    });

    let params;
    if (filterExpression != '') {
      params = {
        TableName: tableName,
        FilterExpression: filterExpression,
        ExpressionAttributeValues: AttriValueExpr,
      };
    } else {
      params = {
        TableName: tableName,
      };
    }

    const res = await dynamoDb.scan(params).promise();

    return res.Items || [];
  },
};
export default Dynamo;
