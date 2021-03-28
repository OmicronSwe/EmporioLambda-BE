import { APIGatewayProxyHandler } from "aws-lambda";
import {
  response,
  badRequest,
  notFound,
  badResponse,
} from "../../lib/APIResponses";
import Dynamo from "../../services/dynamo/dynamo";
import tableName from "../../services/dynamo/tableName";
import { decodeURI } from "../../lib/decodeURI";

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {
  if (!event.pathParameters) {
    return badRequest("PathParameters missing");
  }

  const keys: Array<string> = [];
  const valueKeys: Array<string> = [];
  let countElement: number = 0;
  let countValue: number = 0;
  let limit: number;
  let dataSearch;

  try {
    dataSearch = JSON.parse(decodeURI(event.pathParameters.search));
  } catch (err) {
    // handle error to parse URI
    console.log(err);
    return badRequest("Bad search path form");
  }

  let filterExpression = "";

  // check if is present name condition
  if (dataSearch.name) {
    // search for product name that cointains the string passed by event
    filterExpression += `contains(#element${countElement}, :Value${countValue}) AND `;
    keys.push("name");
    valueKeys.push(dataSearch.name);
    countElement++;
    countValue++;
  }

  // check if is present price condition
  if (dataSearch.minprice || dataSearch.maxprice) {
    keys.push("price");

    // search for minprice if is passed from event
    if (dataSearch.minprice) {
      filterExpression += `#element${countElement} >= :Value${countValue} AND `;
      valueKeys.push(dataSearch.minprice);
      countValue++;
    }

    // search for maxprice if is passed from event
    if (dataSearch.maxprice) {
      filterExpression += `#element${countElement} <= :Value${countValue} AND `;
      valueKeys.push(dataSearch.maxprice);
      countValue++;
    }
    countElement++;
  }

  // check if is present category condition
  if (dataSearch.category) {
    keys.push("category");
    filterExpression += "(";
    const categories: Array<string> = dataSearch.category.split(",");
    let or: string = " OR ";

    for (let index = 0; index < categories.length; index++) {
      if (index + 1 == categories.length) {
        or = "";
      }

      // build condition by category (category == example OR category ==example2)
      filterExpression += `#element${countElement} = :Value${countValue++}${or}`;
      valueKeys.push(categories[index]);
    }
    filterExpression += ")";
  } else {
    // remove final AND from expression if necessary
    filterExpression = filterExpression.slice(0, -4);
  }

  // check if limit of result is present
  if (dataSearch.limit) {
    limit = dataSearch.limit;
  }

  // check if is present lastEvaluatedKEy of product (for pagination)
  if (dataSearch.lastEvaluatedKey) {
    dataSearch.lastEvaluatedKey = JSON.parse(dataSearch.lastEvaluatedKey);
  }

  const result = await Dynamo.scan(
    tableName.product,
    filterExpression,
    keys,
    valueKeys,
    limit,
    dataSearch.lastEvaluatedKey
  ).catch((err) => {
    // handle dynamoDb error
    console.log(err);
    return null;
  });

  if (!result) {
    return badResponse("Failed to search products");
  }

  if (result.items.length == 0) {
    return notFound("Products not found");
  }

  return response({ data: { result } });
};
