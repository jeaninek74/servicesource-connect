/**
 * Cloudflare R2 storage helper — replaces Manus S3 storage.
 * Uses AWS SDK v3 with the R2 S3-compatible endpoint.
 */
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ENDPOINT = process.env.CLOUDFLARE_R2_ENDPOINT ?? "";
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ?? "";
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ?? "";
const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME ?? "servicesource-assets";

let r2Client: S3Client | null = null;

function getR2Client(): S3Client {
  if (!r2Client) {
    r2Client = new S3Client({
      region: "auto",
      endpoint: R2_ENDPOINT,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return r2Client;
}

export async function storagePut(
  key: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const client = getR2Client();
  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: data,
      ContentType: contentType,
    })
  );
  // R2 public URL (if bucket has public access enabled)
  const url = R2_ENDPOINT
    ? `${R2_ENDPOINT}/${R2_BUCKET_NAME}/${key}`
    : `https://${R2_BUCKET_NAME}.r2.cloudflarestorage.com/${key}`;
  return { key, url };
}

export async function storageGet(
  key: string,
  expiresIn = 3600
): Promise<{ key: string; url: string }> {
  const client = getR2Client();
  const url = await getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }),
    { expiresIn }
  );
  return { key, url };
}
