import { response, badRequest, badResponse, notFound } from '../../lib/APIResponses';
import Dynamo from '../../services/dynamo/dynamo';
import { APIGatewayProxyHandler } from 'aws-lambda';
import tableName from '../../services/dynamo/tableName';
import bucketName from '../../services/s3/bucketName';
import Product, {ProductRequest, ProductDB} from '../../lib/model/product';
import { pushImage } from '../../lib/pushImage';

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return badRequest('Body missing');
  }

  const body: ProductRequest  = JSON.parse(event.body);
  let imageUrl: string = null;



  //if image is present, get URL and push it to s3
  if (body.imageFile) {
    try {
      imageUrl = await pushImage(
        body.imageFile.imageCode,
        body.imageFile.mime,
        bucketName.product_image
      );      
    } catch (err) {
      //handle logic error of push image
      return badRequest(err.name + ' ' + err.message);
    }
  }


  const productDB: ProductDB= {
    id: null,
    name: body.name,
    description: body.description,
    imageUrl: imageUrl,
    price: body.price,
    category: body.category?body.category : null

  }

  //push data to dynamodb
  try {
    const product: Product = new Product(productDB);
    const data: ProductDB = product.toJSON();

    //check if category is in Db
    if (product.getCategory()) {
      const category = await Dynamo.get(tableName.category, 'name', product.getCategory()).catch(
        (err) => {
          //handle error of dynamoDB
          console.log(err);
          return null;
        }
      );

      if (!category) {
        return badResponse('Failed to check category existence');
      }

      if (Object.keys(category).length === 0) {
        return notFound('Category not exist');
      }
    }

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
