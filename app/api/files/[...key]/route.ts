import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { key: string[] } }
) {
  if (!process.env.S3_BUCKET) return NextResponse.json({ error: "S3 not configured" }, { status: 400 });
  const key = params.key.join("/");

  const s3 = new S3Client({
    region: process.env.S3_REGION!,
    endpoint: process.env.S3_ENDPOINT || undefined,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  });

  const obj = await s3.send(new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }));
  const body = await obj.Body?.transformToByteArray();
  return new NextResponse(Buffer.from(body ?? []), {
    headers: { "Content-Type": obj.ContentType || "application/octet-stream" },
  });
}
