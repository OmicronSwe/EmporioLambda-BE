import { response, badRequest, notFound, badResponse } from '../../lib/APIResponses';
import Dynamo from '../../lib/dynamo';
import { APIGatewayProxyHandler } from 'aws-lambda';
import tableName from '../../lib/tableName';
import { decodeURI } from '../../lib/decodeURISearch';

export const index: APIGatewayProxyHandler = async (event) => {
  let priceRange: string = '';
  let category: string = '';
  let filterExpression: string = '';
  let keys: Array<string> = [];
  let valueKeys: Array<string> = [];

  if (event) {
    if (!event.pathParameters) {
      return badRequest('PathParameters missing');
    }

    const dataSearch = JSON.parse(decodeURI(event.pathParameters.search));

    filterExpression = 'contains(#element0, :Value0)';
    keys.push('name');
    valueKeys.push(dataSearch.name);

    if (dataSearch.minprice || dataSearch.maxprice) {
      keys.push('price');

      if (dataSearch.minprice) {
        priceRange += ' AND #element1 >= :Value1';
        valueKeys.push(dataSearch.minprice);
      }

      if (dataSearch.maxprice) {
        priceRange += ' AND #element1 <= :Value2';
        valueKeys.push(dataSearch.maxprice);
      }
    }

    if (dataSearch.category) {
      keys.push('category');
      category += ' AND (';
      let categories: Array<string> = dataSearch.category.split(',');
      //console.log(categories);

      for (let index = 3; index < categories.length + 3; index++) {
        category += 'contains(#element2, :Value' + index + ') OR ';
        valueKeys.push(categories[index - 3]);
      }

      category = category.slice(0, -4);
      category += ')';
    }

    console.log(valueKeys);
    filterExpression += priceRange + category;
  }

  console.log(filterExpression);

  const result = await Dynamo.scan(tableName.product, filterExpression, keys, valueKeys).catch(
    (err) => {
      console.log(err);
      return null;
    }
  );

  if (!result) {
    return badResponse('Failed to search products');
  }

  if (result.length == 0) {
    return notFound('Products not found');
  }

  //console.log(result);
  return response({ data: { result } });
};
