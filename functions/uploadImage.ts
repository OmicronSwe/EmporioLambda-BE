import { APIGatewayProxyHandler } from 'aws-lambda';
import * as fileType from 'file-type';
import { v4 as uuid } from 'uuid';

import * as AWS from 'aws-sdk';

const s3 = new AWS.S3();

const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];

export const uploadImage: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    //TO-DO: manage error of image

    if (!body || !body.image || !body.mime) {
      // manage
    }

    if (!allowedMimes.includes(body.mime)) {
      //manage
    }

    let imageData = body.image;
    if (body.image.substr(0, 7) === 'base64,') {
      imageData = body.image.substr(7, body.image.length);
    }

    //convert to push to S3

    const buffer = Buffer.from(imageData, 'base64');
    const fileInfo = await fileType.fromBuffer(buffer);
    const detectedExt = fileInfo!.ext;
    const detectedMime = fileInfo!.mime;

    if (detectedMime !== body.mime) {
      //manage
    }

    const name = uuid();
    const key = `${name}.${detectedExt}`;

    console.log(`writing image to bucket called ${key}`);

    await s3
      .upload({
        Body: buffer,
        Key: key,
        ContentType: body.mime,
        Bucket: process.env.NAMESPACE + '-imagebucket',
        ACL: 'public-read',
      })
      .promise();
    const url = `https://${process.env.NAMESPACE}-imagebucket.s3-${process.env.REGION}.amazonaws.com/${key}`;
    const response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        imageURL: url,
      }),
    };

    return response;
  } catch (error) {
    console.log('error', error);

    //manage
    //return Responses._400({ message: error.message || 'failed to upload image' });
  }
};
