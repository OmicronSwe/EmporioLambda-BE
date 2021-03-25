import { response, badRequest, badResponse, notFound } from '../../lib/APIResponses';
import Dynamo from '../../lib/dynamo';
import { APIGatewayProxyHandler } from 'aws-lambda';
import tableName from '../../lib/tableName';
import bucketName from '../../lib/bucketName';
import S3services from '../../lib/s3';
import { pushImage } from '../../lib/pushImage';
import Product from '../../lib/model/product';

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return badRequest('Body missing');
  }

  if (!event.pathParameters) {
    return badRequest('PathParameters missing');
  }

  const body = JSON.parse(event.body);

  //get product image in order to delete from S3
  const getProduct = await Dynamo.get(tableName.product, 'id', event.pathParameters.id).catch(
    (err) => {
      //handle error of dynamoDB
      console.log(err);
      return null;
    }
  );

  if (Object.keys(getProduct).length === 0) {
    return notFound('Product not found');
  }

  if (getProduct.image) {
    const keyImage: string = getProduct.image.split('/').pop();

    await S3services.delete(bucketName.product_image, keyImage);
  }

  //if image is present, get URL and push it to s3
  if (body.image) {
    try {
      body.image = await pushImage(body.image.imageCode, body.image.mime, bucketName.product_image);
    } catch (err) {
      //handle logic error of push image
      return badRequest(err.name + ' ' + err.message);
    }
  }

  //update product
  const result = await Dynamo.update(
    tableName.product,
    'id',
    event.pathParameters.id,
    Object.keys(body),
    Object.values(body)
  ).catch((err) => {
    //handle dynamoDb error
    console.log(err);
    return null;
  });

  if (!result) {
    return badResponse('Failed to update product');
  }

  return response({ data: { message: 'Product updated correctly' } });
};
