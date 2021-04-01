import { APIGatewayProxyHandler } from "aws-lambda";
import {
  response,
  badResponse,
  badRequest,
  notFound,
} from "../../lib/APIResponses";
import Dynamo from "../../services/dynamo/dynamo";
import tableName from "../../services/dynamo/tableName";
import bucketName from "../../services/s3/bucketName";
import S3services from "../../services/s3/s3";

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.pathParameters) {
    return badRequest("PathParameters missing");
  }

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

  // delete product
  try {
    await Dynamo.delete(tableName.product, "id", event.pathParameters.id);
    return response({ data: { message: "Product deleted correctly" } });
  } catch (error) {
    return badResponse("Failed to delete product");
  }
};
