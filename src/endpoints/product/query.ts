import { response, badResponse } from '../../lib/APIResponses';
import Dynamo from '../../lib/dynamo';
import { APIGatewayProxyHandler } from 'aws-lambda';
import tableName from '../../lib/tableName';

export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return badResponse('Body missing');
  }

  const body = JSON.parse(event.body);
  let queryCondition = '';

  switch (body.condition) {
    case 'getByName': {
      queryCondition = '#element0 = :Value0';
      break;
    }
    default: {
      return badResponse('Condition not supported');
    }
  }

  delete body.condition;

  //console.log(body);

  const result = await Dynamo.query(
    tableName.product,
    'name_index',
    Object.keys(body),
    Object.values(body),
    queryCondition
  ).catch((err) => {
    console.log('error in Dynamo query: ', err);
    return null;
  });

  if (!result) {
    return badResponse('Failed to query product');
  }

  return response({ data: { result } });
};
