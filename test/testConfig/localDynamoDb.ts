// config for dynamoDB local
const AWS = require("aws-sdk");

AWS.config.update({
  region: "local",
  accessKeyId: "xxxx",
  secretAccessKey: "xxxx",
  endpoint: "http://localhost:8000",
});

export default AWS;
