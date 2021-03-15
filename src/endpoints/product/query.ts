import { response, badRequest, notFound, badResponse } from '../../lib/APIResponses';
import Dynamo from '../../lib/dynamo';
import { APIGatewayProxyHandler } from 'aws-lambda';
import tableName from '../../lib/tableName';

export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return badRequest('Body missing');
  }

  const body = JSON.parse(event.body);
  let queryCondition = '';

  switch (body.condition) {
    case 'getByName': {
      queryCondition = '#element0 = :Value0';
      break;
    }
    default: {
      //console.log('not supported')
      return badRequest('Condition not supported');
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
    console.log(err);
    return null;
  });

  if (!result) {
    return badResponse('Failed to query products');
  }

  if (result.length == 0) {
    return notFound('Products not found');
  }

  //console.log(result);
  return response({ data: { result } });
};
