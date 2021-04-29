module.exports.getProduct = (event, context, callback) => {
  // Do work to retrieve Product

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      data: "test cors",
    }),
  };

  callback(null, response);
};
