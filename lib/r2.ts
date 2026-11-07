import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const imageUrl = (key: string) => `${process.env.R2_PUBLIC_URL}/${key}`;

export function uploadImage(key: string, body: Buffer) {
  return r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET!,
    Key: key,
    Body: body,
    ContentType: "image/webp",
    CacheControl: "public, max-age=31536000, immutable",
  }));
}

export function deleteImage(key: string) {
  return r2.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET!, Key: key }));
}