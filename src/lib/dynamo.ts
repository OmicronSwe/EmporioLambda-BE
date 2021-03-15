import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

const Dynamo = {
  get: async (
    primaryKey: string,
    primaryKeyValue: string,
    tableName: string
  ): Promise<DynamoDB.AttributeMap> => {
    const params = {
      TableName: tableName,
      Key: {
        [primaryKey]: primaryKeyValue,
      },
    };

    const data = await dynamoDb
      .get(params)
      .promise()
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw Error(`Error in Dynamo get from table ${tableName}: ` + err);
      });

    //console.log(data);

    return data.Item ? data.Item : {};
  },

  write: async (data, tableName: string): Promise<object> => {
    const params = {
      TableName: tableName,
      Item: data,
    };

    await dynamoDb
      .put(params)
      .promise()
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw Error(`Error in Dynamo write in table ${tableName}: ` + err);
      });

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
      throw Error(
        `Error in Dynamo update in table ${tableName}: Key element and Value element must have the same number element`
      );
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
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw Error(`Error in Dynamo update in table ${tableName}: ` + err);
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

    //console.log(params);

    const res = await dynamoDb
      .query(params)
      .promise()
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw Error(`Error in Dynamo query in table in table ${tableName}: ` + err);
      });

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
      //scan by condition
      params = {
        TableName: tableName,
        FilterExpression: filterExpression,
        ExpressionAttributeValues: AttriValueExpr,
      };
    } else {
      //all scan
      params = {
        TableName: tableName,
      };
    }

    const res = await dynamoDb
      .scan(params)
      .promise()
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw Error(`Error in Dynamo scan in table ${tableName}: ` + err);
      });

    return res.Items || [];
  },

  delete: async (primaryKey: string, primaryKeyValue: string, tableName: string) => {
    const params = {
      TableName: tableName,
      Key: {
        [primaryKey]: primaryKeyValue,
      },
    };

    return dynamoDb
      .delete(params)
      .promise()
      .then(function (data) {
        return data;
      })
      .catch(function (err) {
        throw Error(`Error in Dynamo delete in table ${tableName}: ` + err);
      });
  },
};
export default Dynamo;
