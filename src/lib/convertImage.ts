import * as fileType from 'file-type';
import { v4 as uuid } from 'uuid';
import S3services from './s3';

const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];

export async function ConvertImage(
  image: string,
  mime: string,
  bucketName: string
): Promise<string> {
  if (!allowedMimes.includes(mime)) {
    throw Error('mime is not allowed');
  }

  let imageData: string;

  if (image && image.substr(0, 7) === 'base64,') {
    imageData = image.substr(7, image.length);
  }

  const buffer = Buffer.from(imageData, 'base64');
  const fileInfo = await fileType.fromBuffer(buffer);
  const detectedExt = fileInfo!.ext;
  const detectedMime = fileInfo!.mime;

  if (detectedMime !== mime) {
    throw Error('mime types dont match');
  }

  const name = uuid();
  const key = `${name}.${detectedExt}`;

  const url = `https://${bucketName}.s3-${process.env.REGION}.amazonaws.com/${key}`;

  //upload to s3
  await S3services.upload(buffer, key, mime, bucketName);

  return url;
}
