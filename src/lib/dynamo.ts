import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

const Dynamo = {
  /**
   * @param  {string} primaryKey: the key of the table
   * @param  {string} primaryKeyValue: the value of the key
   * @param  {string} tableName: the table name
   * @returns Promise
   */
  get: async (
    primaryKey: string,
    primaryKeyValue: string,
    tableName: string
  ): Promise<DynamoDB.AttributeMap> => {
    const params: DynamoDB.DocumentClient.GetItemInput = {
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

  /**
   * @param  {} data: data in the object JS form to write in the table
   * @param  {string} tableName: table name
   * @returns Promise
   */
  write: async (data, tableName: string): Promise<object> => {
    const params: DynamoDB.DocumentClient.PutItemInput = {
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

  /**
   * @param  {string} tableName: name of the table
   * @param  {string} primaryKey: the key of the table
   * @param  {string} primaryKeyValue: the value of the key
   * @param  {Array<string>} updateKey: name of the column in the table to update
   * @param  {Array<string>} updateValue: value of the column to update in the table
   * @returns Promise
   */
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

    const params: DynamoDB.DocumentClient.UpdateItemInput = {
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

  /**
   * @param  {string} tableName: name of the table
   * @param  {string} index: index name in the table
   * @param  {Array<string>} element: name of the element (the first must be the key)
   * @param  {Array<string>} value: value of the element (the firt must be of the key->element0)
   * @param  {string} keyCondition: condition of the key
   * @param  {string} filterExpression: the expression filter for query (optional)
   * @returns Promise
   */
  query: async (
    tableName: string,
    index: string,
    element: Array<string>,
    value: Array<string>,
    keyCondition: string,
    filterExpression: string = ''
  ): Promise<DynamoDB.ItemList> => {
    let AttriNameExpr: { [k: string]: string } = {};
    let AttriValueExpr: { [k: string]: any } = {};

    //create key and value element for query
    element.forEach((element, index) => {
      AttriNameExpr['#element' + index] = element;
    });

    value.forEach((element, index) => {
      if (isNaN(+element)) {
        AttriValueExpr[':Value' + index] = element;
      } else {
        AttriValueExpr[':Value' + index] = Number(element);
      }
    });

    const params: DynamoDB.DocumentClient.QueryInput = {
      TableName: tableName,
      IndexName: index,
      ExpressionAttributeNames: AttriNameExpr,
      KeyConditionExpression: keyCondition,
      ExpressionAttributeValues: AttriValueExpr,
    };

    if (filterExpression != '') {
      params.FilterExpression = filterExpression;
    }

    console.log(params);

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

  /**
   * @param  {string} tableName: name of the table
   * @param  {string=''} filterExpression: the expression filter for scan (optional)
   * @param  {Array<string>=[]} element: element of the expression filter (optional)
   * @param  {Array<string>=[]} value: value of the expression filter (optional)
   * @returns Promise
   */
  scan: async (
    tableName: string,
    filterExpression: string = '',
    element: Array<string> = [],
    value: Array<string> = []
  ): Promise<DynamoDB.ItemList> => {
    let AttriNameExpr: { [k: string]: string } = {};
    let AttriValueExpr: { [k: string]: any } = {};

    //create key and value element for query
    element.forEach((element, index) => {
      AttriNameExpr['#element' + index] = element;
    });

    value.forEach((element, index) => {
      if (isNaN(+element)) {
        AttriValueExpr[':Value' + index] = element;
      } else {
        AttriValueExpr[':Value' + index] = Number(element);
      }
    });

    const params: DynamoDB.DocumentClient.ScanInput = {
      TableName: tableName,
    };

    if (filterExpression != '') {
      //scan by condition
      params.FilterExpression = filterExpression;
      params.ExpressionAttributeValues = AttriValueExpr;
      params.ExpressionAttributeNames = AttriNameExpr;
    }

    console.log(params);

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

  /**
   * @param  {string} primaryKey: the key of the table
   * @param  {string} primaryKeyValue: the value of the key
   * @param  {string} tableName: the table name
   */
  delete: async (primaryKey: string, primaryKeyValue: string, tableName: string) => {
    const params: DynamoDB.DocumentClient.DeleteItemInput = {
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
