import { response, notFound, badResponse } from '../../lib/APIResponses';
import Dynamo from '../../services/dynamo/dynamo';
import { APIGatewayProxyHandler } from 'aws-lambda';
import tableName from '../../services/dynamo/tableName';
import { ProductDB } from '../../model/product/interface';

export const index: APIGatewayProxyHandler = async () => {
  const result = await Dynamo.scan(tableName.product).catch((err) => {
    //handle error of dynamoDB
    console.log(err);
    return null;
  });

  if (!result) {
    return badResponse('Failed to scan product');
  }

  if (result.items.length == 0) {
    return notFound('Products not found');
  }

  return response({ data: { result } });
};
