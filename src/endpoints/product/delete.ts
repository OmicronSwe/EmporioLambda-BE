import { APIGatewayProxyHandler } from "aws-lambda";
import {
  response,
  badResponse,
  badRequest,
  notFound,
} from "../../lib/APIResponses";
import Dynamo from "../../services/dynamo/dynamo";
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
      process.env.PRODUCT_TABLE,
      "id",
      event.pathParameters.id
    );

    if (Object.keys(getProduct).length === 0) {
      return notFound("Product not found");
    }

    if (getProduct.imageUrl) {
      const keyImage: string = getProduct.imageUrl.split("/").pop();

      await S3services.delete(process.env.BUCKET_IMAGE, keyImage);
    }
  } catch (error) {
    return badResponse("Failed to delete product image");
  }

  // delete product
  try {
    await Dynamo.delete(
      process.env.PRODUCT_TABLE,
      "id",
      event.pathParameters.id
    );
    return response({ data: { message: "Product deleted correctly" } });
  } catch (error) {
    return badResponse("Failed to delete product");
  }
};
