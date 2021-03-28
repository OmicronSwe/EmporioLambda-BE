import { APIGatewayProxyHandler } from "aws-lambda";
import {
  response,
  badRequest,
  badResponse,
  notFound,
} from "../../lib/APIResponses";
import Dynamo from "../../services/dynamo/dynamo";
import tableName from "../../services/dynamo/tableName";
import bucketName from "../../services/s3/bucketName";
import S3services from "../../services/s3/s3";
import { pushImage } from "../../lib/pushImage";
import { ProductDB } from "../../model/product/interface";

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return badRequest("Body missing");
  }

  if (!event.pathParameters) {
    return badRequest("PathParameters missing");
  }

  const body = JSON.parse(event.body);

  // get product image in order to delete from S3
  const getProduct: ProductDB = await Dynamo.get(
    tableName.product,
    "id",
    event.pathParameters.id
  ).catch((err) => {
    // handle error of dynamoDB
    console.log(err);
    return null;
  });

  if (Object.keys(getProduct).length === 0) {
    return notFound("Product not found");
  }

  if (getProduct.imageUrl) {
    const keyImage: string = getProduct.imageUrl.split("/").pop();

    await S3services.delete(bucketName.product_image, keyImage);
  }

  // if image is present, get URL and push it to s3
  if (body.imageFile) {
    try {
      body.imageUrl = await pushImage(
        body.imageFile.imageCode,
        body.imageFile.mime,
        bucketName.product_image
      );
      delete body.imageFile;
    } catch (err) {
      // handle logic error of push image
      return badRequest(`${err.name} ${err.message}`);
    }
  }

  // update product
  const result = await Dynamo.update(
    tableName.product,
    "id",
    event.pathParameters.id,
    Object.keys(body),
    Object.values(body)
  ).catch((err) => {
    // handle dynamoDb error
    console.log(err);
    return null;
  });

  if (!result) {
    return badResponse("Failed to update product");
  }

  return response({ data: { message: "Product updated correctly" } });
};
