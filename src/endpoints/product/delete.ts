import { response, badResponse, badRequest, notFound } from '../../lib/APIResponses';
import Dynamo from '../../lib/dynamo';
import { APIGatewayProxyHandler } from 'aws-lambda';
import tableName from '../../lib/tableName';
import bucketName from '../../lib/bucketName';
import S3services from '../../lib/s3';

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.pathParameters) {
    return badRequest('PathParameters missing');
  }

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

  if (getProduct.imageUrl) {
    const keyImage: string = getProduct.imageUrl.split('/').pop();

    await S3services.delete(bucketName.product_image, keyImage);
  }

  //delete Element
  const result = await Dynamo.delete(tableName.product, 'id', event.pathParameters.id).catch(
    (err) => {
      //handle error of dynamoDB
      console.log(err);
      return null;
    }
  );

  if (!result) {
    return badResponse('Failed to delete product');
  }

  return response({ data: { message: 'Product deleted correctly' } });
};
