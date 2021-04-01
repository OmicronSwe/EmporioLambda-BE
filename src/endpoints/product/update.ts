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

  // if image is present, get URL and push it to s3
  if (body.imageFile) {
    // get image
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

    // delete old image
    try {
      const getProduct = await Dynamo.get(
        tableName.product,
        "id",
        event.pathParameters.id
      );

      if (Object.keys(getProduct).length === 0) {
        return notFound("Product not found");
      }

      if (getProduct.imageUrl) {
        const keyImage: string = getProduct.imageUrl.split("/").pop();

        await S3services.delete(bucketName.product_image, keyImage);
      }
    } catch (error) {
      return badResponse("Failed to delete product image");
    }
  }

  try {
    await Dynamo.update(
      tableName.product,
      "id",
      event.pathParameters.id,
      Object.keys(body),
      Object.values(body)
    );

    return response({ data: { message: "Product updated correctly" } });
  } catch (error) {
    return badResponse("Failed to update product");
  }
};
