import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildPaths, saveBuffer } from "@/lib/safeUpload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.startsWith("multipart/form-data")) {
      return NextResponse.json(
        { error: "Expected multipart/form-data" },
        { status: 400 }
      );
    }

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const companyId = form.get("companyId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!companyId) {
      return NextResponse.json(
        { error: "companyId is required" },
        { status: 400 }
      );
    }

    const isAuthorized =
      session.user.role === "ADMIN" ||
      (session.user.role === "COMPANY" &&
        session.user.companyId === companyId) ||
      (session.user.role === "ACCOUNTANT" &&
        (await prisma.accountantClient.findFirst({
          where: {
            accountantId: session.user.id,
            companyId: companyId,
          },
        })));

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Not authorized to upload for this company" },
        { status: 403 }
      );
    }

    const arrayBuf = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);

    const { rel, abs } = buildPaths(companyId, file.name);
    await saveBuffer(abs, buffer);

    const doc = await prisma.document.create({
      data: {
        companyId: companyId,
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: buffer.length,
        storagePath: rel,
        uploadedById: session.user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        document: {
          id: doc.id,
          filename: doc.filename,
          mimeType: doc.mimeType,
          sizeBytes: doc.sizeBytes,
          createdAt: doc.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error("Upload error:", e);
    return NextResponse.json(
      { error: "Upload failed", details: e?.message },
      { status: 500 }
    );
  }
}
