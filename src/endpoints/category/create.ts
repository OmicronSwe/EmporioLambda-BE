import { APIGatewayProxyHandler } from "aws-lambda";
import { response, badRequest, badResponse } from "../../lib/APIResponses";
import Dynamo from "../../services/dynamo/dynamo";

import Category from "../../model/category/category";
import { CategoryDB } from "../../model/category/interface";
/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.body) {
    return badRequest("Body missing");
  }

  const body: CategoryDB = JSON.parse(event.body);

  let category;

  try {
    category = new Category(body);
  } catch (err) {
    // handle logic error of category
    return badRequest(`${err.name} ${err.message}`);
  }
  const name = category.getName();

  try {
    const resultGet = await Dynamo.get(
      process.env.CATEGORY_TABLE,
      "name",
      name
    );

    if (Object.keys(resultGet).length >= 1) {
      return badRequest("Category already exists");
    }
  } catch (error) {
    return badResponse("Failed to create category");
  }

  const data = category.toJSON();

  try {
    await Dynamo.write(process.env.CATEGORY_TABLE, data);
    return response({
      data: { message: `Category "${category.name}" created correctly` },
    });
  } catch (error) {
    return badResponse("Failed to create category");
  }
};
