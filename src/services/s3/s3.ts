import { S3 } from "aws-sdk";

const s3 = new S3();

const S3services = {
  /**
   * @param  {string} bucket: bucket name where to push file
   * @param  {Buffer} data: data file that must be pushed to S3
   * @param  {string} key: key of the file
   * @param  {string} contentType: exstension of the file
   * @param  {string='public-read'} ACL: Access Control List (optional)
   * @returns Promise
   */
  upload: (
    bucket: string,
    data: Buffer,
    key: string,
    contentType: string,
    ACL: string = "public-read"
  ): Promise<S3.ManagedUpload.SendData> => {
    const params: S3.PutObjectRequest = {
      Body: data,
      Key: key,
      ContentType: contentType,
      Bucket: bucket,
      ACL,
    };

    return s3
      .upload(params)
      .promise()
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw Error(`Error in S3 upload for bucket ${bucket}: ${err}`);
      });
  },
  /**
   * @param  {string} bucket: bucket name where to delete file
   * @param  {string} key: key of file
   * @returns Promise
   */
  delete: (bucket: string, key: string): Promise<S3.DeleteObjectOutput> => {
    const params: S3.DeleteObjectRequest = {
      Key: key,
      Bucket: bucket,
    };

    return s3
      .deleteObject(params)
      .promise()
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw Error(`Error in S3 delete for bucket ${bucket}: ${err}`);
      });
  },
};
export default S3services;
