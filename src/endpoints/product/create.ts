import { response, badRequest, badResponse } from '../../lib/APIResponses';
import Dynamo from '../../lib/dynamo';
import { APIGatewayProxyHandler } from 'aws-lambda';
import tableName from '../../lib/tableName';
import bucketName from '../../lib/bucketName';
import Product from '../../lib/model/product';
import { ConvertImage } from '../../lib/convertImage';

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return badRequest('Body missing');
  }

  if (event.body.image && event.body.mime) {
    try {
      event.body.image = await ConvertImage(
        event.body.image,
        event.body.mime,
        bucketName.product_image
      );
    } catch (err) {
      //handle logic error of product
      return badResponse(err.name + ' ' + err.message);
    }
  }

  try {
    const product = new Product(JSON.parse(event.body));
    const data = product.getData();

    const newProduct = await Dynamo.write(tableName.product, data).catch((err) => {
      //handle error of dynamoDB
      console.log(err);
      return null;
    });

    if (!newProduct) {
      return badResponse('Failed to create product');
    }

    return response({ data: { message: 'Product "' + product.name + '" created correctly' } });
  } catch (err) {
    //handle logic error of product
    return badRequest(err.name + ' ' + err.message);
  }
};
