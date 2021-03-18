import * as fileType from 'file-type';
import { v4 as uuid } from 'uuid';
import S3services from './s3';

const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];

/**
 * @param  {string} image: code of image (generally base64)
 * @param  {string} mime: mime of the image (type)
 * @param  {string} bucketName: bucket where to push the image
 * @returns Promise
 */
export async function pushImage(image: string, mime: string, bucketName: string): Promise<string> {
  if (!mime || !image) {
    throw Error('mime or image not found');
  }

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
    throw Error("mime types don't match");
  }

  const name = uuid();
  const key = `${name}.${detectedExt}`;

  const url = `https://${bucketName}.s3-${process.env.REGION}.amazonaws.com/${key}`;

  //upload to s3
  await S3services.upload(bucketName, buffer, key, mime);

  return url;
}
