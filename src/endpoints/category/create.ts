import { response, badRequest, badResponse, notFound } from '../../lib/APIResponses';
import Dynamo from '../../lib/dynamo';
import { APIGatewayProxyHandler } from 'aws-lambda';
import tableName from '../../lib/tableName';
import Category from '../../lib/model/category';

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return badRequest('Body missing');
  }

  try {
    const category = new Category(JSON.parse(event.body));
    const name = category.getName();

    const resultGet = await Dynamo.get(tableName.category, 'name', name).catch((err) => {
      //handle error of dynamoDB
      console.log(err);
      return null;
    });

    if (!resultGet) {
      return badResponse('Failed to create category');
    }

    if (Object.keys(resultGet).length >= 1) {
      return badRequest('Category already exists');
    }

    const data = category.toJSON();

    const newCategory = await Dynamo.write(tableName.category, data).catch((err) => {
      //handle error of dynamoDB
      console.log(err);
      return badResponse('Failed to create category');
    });

    if (!newCategory) {
      return badResponse('Failed to create category');
    }

    return response({ data: { message: 'Category "' + category.name + '" created correctly' } });
  } catch (err) {
    //handle logic error of category
    return badRequest(err.name + ' ' + err.message);
  }
};
