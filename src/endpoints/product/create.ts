import { APIGatewayProxyHandler } from "aws-lambda";
import {
  response,
  badRequest,
  badResponse,
  notFound,
} from "../../lib/APIResponses";
import Dynamo from "../../services/dynamo/dynamo";
import Product from "../../model/product/product";
import { CreateProductRequest, ProductDB } from "../../model/product/interface";
import { pushImage } from "../../lib/pushImage";

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return badRequest("Body missing");
  }

  const body: CreateProductRequest = JSON.parse(event.body);
  let imageUrl: string = null;
  let product;

  // if image is present, get URL and push it to s3
  if (body.imageFile) {
    try {
      imageUrl = await pushImage(
        body.imageFile.imageCode,
        body.imageFile.mime,
        process.env.BUCKET_IMAGE
      );
    } catch (err) {
      // handle logic error of push image
      return badRequest(`${err.name} ${err.message}`);
    }
  }

  const productDB: ProductDB = {
    name: body.name,
    description: body.description,
    imageUrl,
    price: body.price,
    category: body.category ? body.category : null,
  };

  // push data to dynamodb
  try {
    product = new Product(productDB);
  } catch (err) {
    // handle logic error of product
    return badRequest(`${err.name} ${err.message}`);
  }

  // check if category is in Db
  if (product.getCategory()) {
    try {
      const category = await Dynamo.get(
        process.env.CATEGORY_TABLE,
        "name",
        product.getCategory()
      );

      if (Object.keys(category).length === 0) {
        return notFound("Category not exist");
      }
    } catch (error) {
      return badResponse("Failed to check category existence");
    }
  }

  try {
    await Dynamo.write(process.env.PRODUCT_TABLE, product.toJSON());
    return response({
      data: { message: `Product "${product.name}" created correctly` },
    });
  } catch (error) {
    return badResponse("Failed to create product");
  }
};
