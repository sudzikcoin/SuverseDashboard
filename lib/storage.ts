import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

const isProd = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

const s3Enabled = !!(
  process.env.S3_BUCKET &&
  process.env.S3_REGION &&
  process.env.S3_ACCESS_KEY_ID &&
  process.env.S3_SECRET_ACCESS_KEY
);

const s3 = s3Enabled
  ? new S3Client({
      region: process.env.S3_REGION!,
      endpoint: process.env.S3_ENDPOINT || undefined,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    })
  : null;

export type StoredFile = {
  url?: string;
  storageKey?: string;
};

export async function storeBytes(
  bytes: Buffer,
  filename: string,
  mime: string
): Promise<StoredFile> {
  if (s3 && s3Enabled) {
    const key = `uploads/${Date.now()}-${filename}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
        Body: bytes,
        ContentType: mime,
      })
    );
    const publicBase = process.env.PUBLIC_BASE_URL || "";
    const url = publicBase ? `${publicBase}/api/files/${encodeURIComponent(key)}` : undefined;
    return { url, storageKey: key };
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  const safeName = `${Date.now()}-${filename}`.replace(/[^\w.\-]/g, "_");
  const rel = `/uploads/${safeName}`;
  fs.writeFileSync(path.join(uploadsDir, safeName), bytes);
  return { url: rel, storageKey: rel };
}
