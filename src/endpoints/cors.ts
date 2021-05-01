module.exports.handler = (event, context, callback) => {
  const response = {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "https://www.google.it/",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({
      data: "test cors",
    }),
  };

  callback(null, response);
};
