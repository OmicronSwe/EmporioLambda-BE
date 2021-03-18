import { S3 } from 'aws-sdk';

const s3 = new S3();

const S3services = {
  upload: async (
    data: Buffer,
    key: string,
    contentType: string,
    bucket: string,
    ACL: string = 'public-read'
  ): Promise<S3.ManagedUpload.SendData> => {
    return await s3
      .upload({
        Body: data,
        Key: key,
        ContentType: contentType,
        Bucket: bucket,
        ACL: 'public-read',
      })
      .promise()
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw Error(`Error in S3 upload for bucket ${bucket}: ` + err);
      });
  },
};
export default S3services;
