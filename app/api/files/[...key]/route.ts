import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { key: string[] } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.S3_BUCKET) {
    return NextResponse.json({ error: "S3 not configured" }, { status: 400 });
  }

  const key = params.key.join("/");

  const document = await prisma.document.findFirst({
    where: { storagePath: key }
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const isAuthorized = 
    session.user.role === "ADMIN" ||
    document.uploadedById === session.user.id ||
    (document.companyId && session.user.companyId === document.companyId) ||
    (document.companyId && session.user.role === "ACCOUNTANT" && 
      await prisma.accountantClient.findFirst({
        where: {
          accountantId: session.user.id,
          companyId: document.companyId
        }
      })
    );

  if (!isAuthorized) {
    return NextResponse.json({ error: "Not authorized to access this file" }, { status: 403 });
  }

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
