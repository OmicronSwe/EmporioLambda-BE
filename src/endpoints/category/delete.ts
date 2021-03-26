import { response, badResponse, badRequest, notFound } from '../../lib/APIResponses';
import Dynamo from '../../services/dynamo/dynamo';
import { APIGatewayProxyHandler } from 'aws-lambda';
import tableName from '../../services/dynamo/tableName';

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.pathParameters) {
    return badRequest('PathParameters missing');
  }

  const scanCategory = await Dynamo.scan(
    tableName.product,
    '#element0 = :Value0',
    ['category'],
    [event.pathParameters.name]
  ).catch((err) => {
    //handle error of dynamoDB
    console.log(err);
    return null;
  });

  console.log(scanCategory);

  if (scanCategory.items.length >= 1) {
    return badRequest('Category is being used');
  }

  const result = await Dynamo.delete(
    tableName.category,
    'name',
    decodeURIComponent(event.pathParameters.name)
  ).catch((err) => {
    //handle error of dynamoDB
    console.log(err);
    return null;
  });

  if (!result) {
    return badResponse('Failed to delete category');
  }

  return response({ data: { message: 'Category deleted correctly' } });
};
