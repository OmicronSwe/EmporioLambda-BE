import { DynamoDB } from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient();

const Dynamo = {
  /**
   * @param  {string} tableName: the table name
   * @param  {string} primaryKey: the key of the table
   * @param  {string} primaryKeyValue: the value of the key
   * @returns Promise
   */
  get: async (
    tableName: string,
    primaryKey: string,
    primaryKeyValue: string
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
        throw Error(`Error in Dynamo get from table ${tableName}: ${err}`);
      });

    return data.Item ? data.Item : {};
  },

  /**
   * @param  {string} tableName: table name
   * @param  {} data: data in the object JS form to write in the table
   * @returns Promise
   */
  write: async (tableName: string, data): Promise<DynamoDB.PutItemOutput> => {
    const params: DynamoDB.DocumentClient.PutItemInput = {
      TableName: tableName,
      Item: data,
    };

    return dynamoDb
      .put(params)
      .promise()
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw Error(`Error in Dynamo write in table ${tableName}: ${err}`);
      });
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
    updateElement: Array<string>,
    updateValue: Array<string>
  ): Promise<DynamoDB.UpdateItemOutput> => {
    if (updateElement.length != updateValue.length) {
      throw Error(
        `Error in Dynamo update in table ${tableName}: Key element and Value element must have the same number element`
      );
    }

    let updateExpr: string = "SET ";
    const AttriNameExpr: { [k: string]: string } = {};
    const AttriValueExpr: { [k: string]: any } = {};

    // create expression for update
    for (let index = 0; index < updateElement.length; index++) {
      updateExpr += `#element${index} = :value${index},`;
    }

    updateExpr = updateExpr.slice(0, -1);

    // create element and value for update
    updateElement.forEach((element, index) => {
      AttriNameExpr[`#element${index}`] = element;

      if (Number.isNaN(+updateValue[index])) {
        AttriValueExpr[`:value${index}`] = updateValue[index];
      } else {
        AttriValueExpr[`:value${index}`] = Number(updateValue[index]);
      }
    });

    const params: DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: tableName,
      Key: { [primaryKey]: primaryKeyValue },
      ExpressionAttributeNames: AttriNameExpr,
      UpdateExpression: updateExpr,
      ExpressionAttributeValues: AttriValueExpr,
    };

    // console.log(params);

    return dynamoDb
      .update(params)
      .promise()
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw Error(`Error in Dynamo update in table ${tableName}: ${err}`);
      });
  },

  /** Usare solo se si conoscono le chiavi primarie, secondarie o gli indici della tabella, perchè almeno uno di questi è necessario
   *  (più veloce della scan per questo motivo)
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
    indexName: string,
    element: Array<string>,
    value: Array<string>,
    keyCondition: string,
    filterExpression: string = "",
    limit?: number,
    exclusiveStartKey?: string
  ): Promise<object> => {
    const AttriNameExpr: { [k: string]: string } = {};
    const AttriValueExpr: { [k: string]: any } = {};

    // create element for query
    element.forEach((element, index) => {
      AttriNameExpr[`#element${index}`] = element;
    });

    // create value for query
    value.forEach((element, index) => {
      if (Number.isNaN(+element)) {
        AttriValueExpr[`:Value${index}`] = element;
      } else {
        AttriValueExpr[`:Value${index}`] = Number(element);
      }
    });

    const params: DynamoDB.DocumentClient.QueryInput = {
      TableName: tableName,
      IndexName: indexName,
      KeyConditionExpression: keyCondition,
      ExpressionAttributeNames: AttriNameExpr,
      ExpressionAttributeValues: AttriValueExpr,
    };

    // add filterExpression if not empty
    if (filterExpression != "") {
      params.FilterExpression = filterExpression;
    }

    if (limit) {
      params.Limit = limit;
    }

    if (exclusiveStartKey) {
      params.ExclusiveStartKey = { item_id: exclusiveStartKey };
    }

    const res = await dynamoDb
      .query(params)
      .promise()
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw Error(
          `Error in Dynamo query in table in table ${tableName}: ${err}`
        );
      });

    return { items: res.Items || [], lastEvaluatedKey: res.LastEvaluatedKey };
  },

  /** Percorre tutta la tabella e poi applica le condizioni, per questo più lenta della query. Non serve identificare le
   * chiavi primarie, secondarie o indici
   * @param  {string} tableName: name of the table
   * @param  {string=''} filterExpression: the expression filter for scan (optional)
   * @param  {Array<string>=[]} element: element of the expression filter (optional)
   * @param  {Array<string>=[]} value: value of the expression filter (optional)
   * @param  {number} limit? : limit of the item result
   * @param  {object} startKey? key of item in order to get item after this element key (for pagination)
   * @returns Promise
   */
  /**
   * @param  {string} tableName
   * @param  {string=""} filterExpression
   * @param  {Array<string>=[]} element
   * @param  {Array<string>=[]} value
   
   * @returns Promise
   */
  scan: async (
    tableName: string,
    filterExpression: string = "",
    element: Array<string> = [],
    value: Array<string> = [],
    limit?: number,
    startKey?: object
  ): Promise<object> => {
    const AttriNameExpr: { [k: string]: string } = {};
    const AttriValueExpr: { [k: string]: any } = {};

    // create element for scan
    element.forEach((element, index) => {
      AttriNameExpr[`#element${index}`] = element;
    });

    // create value for scan
    value.forEach((element, index) => {
      if (Number.isNaN(+element)) {
        AttriValueExpr[`:Value${index}`] = element;
      } else {
        AttriValueExpr[`:Value${index}`] = Number(element);
      }
    });

    const params: DynamoDB.DocumentClient.ScanInput = {
      TableName: tableName,
    };

    // add filterExpression if not empty
    if (filterExpression != "") {
      // scan by condition
      params.FilterExpression = filterExpression;
      params.ExpressionAttributeValues = AttriValueExpr;
      params.ExpressionAttributeNames = AttriNameExpr;
    }

    if (startKey) {
      // console.log(startKey);
      params.ExclusiveStartKey = startKey;
      // console.log(params.ExclusiveStartKey.id);
    }

    if (limit) {
      params.Limit = limit;
    }

    const res = await dynamoDb
      .scan(params)
      .promise()
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw Error(`Error in Dynamo scan in table ${tableName}: ${err}`);
      });

    return { items: res.Items || [], lastEvaluatedKey: res.LastEvaluatedKey };
  },

  /**
   * @param  {string} tableName: the table name
   * @param  {string} primaryKey: the key of the table
   * @param  {string} primaryKeyValue: the value of the key
   */
  delete: async (
    tableName: string,
    primaryKey: string,
    primaryKeyValue: string
  ): Promise<DynamoDB.DeleteItemOutput> => {
    const params: DynamoDB.DocumentClient.DeleteItemInput = {
      TableName: tableName,
      Key: {
        [primaryKey]: primaryKeyValue,
      },
    };

    return dynamoDb
      .delete(params)
      .promise()
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw Error(`Error in Dynamo delete in table ${tableName}: ${err}`);
      });
  },
};
export default Dynamo;