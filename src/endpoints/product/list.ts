import { response, notFound, badResponse } from '../../lib/APIResponses';
import Dynamo from '../../lib/dynamo';
import { APIGatewayProxyHandler } from 'aws-lambda';
import tableName from '../../lib/tableName';

export const index: APIGatewayProxyHandler = async (event) => {
  let filterCondition: string = '';
  let valueCondition: Array<string> = [];

  if (event != undefined && event.body) {
    const body = JSON.parse(event.body);
    //TO-DO manage condition
  }

  const result = await Dynamo.scan(tableName.product, filterCondition, valueCondition).catch(
    (err) => {
      console.log(err);
      return null;
    }
  );

  if (!result) {
    return badResponse('Failed to scan product');
  }

  if (result.length == 0) {
    return notFound('Products not found');
  }

  return response({ data: { result } });
};
