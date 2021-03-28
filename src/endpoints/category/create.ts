import { APIGatewayProxyHandler } from "aws-lambda";
import { response, badRequest, badResponse } from "../../lib/APIResponses";
import Dynamo from "../../services/dynamo/dynamo";
import tableName from "../../services/dynamo/tableName";
import Category from "../../model/category";

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return badRequest("Body missing");
  }

  try {
    const category = new Category(JSON.parse(event.body));
    const name = category.getName();

    const resultGet = await Dynamo.get(tableName.category, "name", name).catch(
      () => {
        // handle error of dynamoDB
        return null;
      }
    );

    if (!resultGet) {
      return badResponse("Failed to create category");
    }

    if (Object.keys(resultGet).length >= 1) {
      return badRequest("Category already exists");
    }

    const data = category.toJSON();

    return await Dynamo.write(tableName.category, data)
      .then(() => {
        return response({
          data: { message: `Category "${category.name}" created correctly` },
        });
      })
      .catch(() => {
        // handle error of dynamoDB
        return badResponse("Failed to create category");
      });
  } catch (err) {
    // handle logic error of category
    return badRequest(`${err.name} ${err.message}`);
  }
};
