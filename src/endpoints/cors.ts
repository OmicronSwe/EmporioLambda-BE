module.exports.handler = (event, context, callback) => {
  // Do work to retrieve Product

  const response = {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: "test cors",
    }),
  };

  callback(null, response);
};
