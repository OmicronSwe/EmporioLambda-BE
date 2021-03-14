import { response, badResponse } from '../../lib/APIResponses';
import Dynamo from '../../lib/dynamo';
import { APIGatewayProxyHandler } from 'aws-lambda';
import tableName from '../../lib/tableName';
import Product from '../../lib/model/product';

export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return badResponse('Body missing');
  }

  try {
    const product = new Product(JSON.parse(event.body));
    const data = product.getData();

    const newProduct = await Dynamo.write(data, tableName.product).catch((err) => {
      console.log('error in Dynamo write', err);
      return null;
    });

    if (!newProduct) {
      return badResponse('Failed to create product');
    }

    return response({ data: { message: 'Product "' + product.name + '" created correctly' } });
  } catch (err) {
    //handle logic error of product
    return badResponse(err.name + ' ' + err.message);
  }
};
