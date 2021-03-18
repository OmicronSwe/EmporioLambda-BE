import { response, badRequest, badResponse } from '../../lib/APIResponses';
import Dynamo from '../../lib/dynamo';
import { APIGatewayProxyHandler } from 'aws-lambda';
import tableName from '../../lib/tableName';
import bucketName from '../../lib/bucketName';
import Product from '../../lib/model/product';
import { pushImage } from '../../lib/pushImage';

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return badRequest('Body missing');
  }

  const body = JSON.parse(event.body);

  //if image is present, get URL and push it to s3
  if (body.image) {
    try {
      body.image = await pushImage(body.image.imageCode, body.image.mime, bucketName.product_image);
    } catch (err) {
      //handle logic error of push image
      return badRequest(err.name + ' ' + err.message);
    }
  }

  //push data to dynamodb
  try {
    const product = new Product(body);
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
