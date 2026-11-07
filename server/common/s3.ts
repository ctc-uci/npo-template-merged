// TODO: keep file only if using s3 file upload

import crypto from "crypto";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";

dotenv.config();

const region =
  process.env.NODE_ENV === "development"
    ? process.env.DEV_S3_REGION
    : process.env.PROD_S3_REGION;
const accessKeyId =
  process.env.NODE_ENV === "development"
    ? process.env.DEV_S3_ACCESS_KEY_ID
    : process.env.PROD_S3_ACCESS_KEY_ID;
const secretAccessKey =
  process.env.NODE_ENV === "development"
    ? process.env.DEV_S3_SECRET_ACCESS_KEY
    : process.env.PROD_S3_SECRET_ACCESS_KEY;

// initialize an S3 client (AWS SDK v3, signs requests with SigV4 by default).
// If no keys are provided, the SDK falls back to its default credential chain
// (env vars, shared config, IAM role, etc.).
const s3 = new S3Client({
  region,
  credentials:
    accessKeyId && secretAccessKey
      ? { accessKeyId, secretAccessKey }
      : undefined,
});

const getS3UploadURL = async () => {
  // generate a unique name for image
  const imageName = crypto.randomBytes(16).toString("hex");

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: imageName,
  });

  // get a presigned upload url that expires in 60 seconds
  const uploadURL = await getSignedUrl(s3, command, { expiresIn: 60 });

  return uploadURL;
};

export { s3, getS3UploadURL };
