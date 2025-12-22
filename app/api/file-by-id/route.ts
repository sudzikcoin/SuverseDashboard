import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import path from "path";
import { readFile, unlink } from "fs/promises";
import { UPLOADS_ROOT } from "@/lib/safeUpload";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const document = await prisma.document.findUnique({
      where: { id: params.id },
    });

    if (!document) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const isAuthorized =
      session.user.role === "ADMIN" ||
      (session.user.role === "COMPANY" && session.user.companyId === document.companyId) ||
      (session.user.role === "ACCOUNTANT" &&
        (await prisma.accountantClient.findFirst({
          where: {
            accountantId: session.user.id,
            companyId: document.companyId,
          },
        })));

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "You do not have access to this document" },
        { status: 403 }
      );
    }

    const abs = path.join(UPLOADS_ROOT, document.storagePath);
    if (!abs.startsWith(UPLOADS_ROOT)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const buf = await readFile(abs);
    const safeName = path.basename(document.filename).replace(/[^a-zA-Z0-9._-]/g, "_");

    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type": document.mimeType || "application/octet-stream",
        "Content-Disposition": `inline; filename="${safeName}"`,
        "Cache-Control": "private, max-age=0",
      },
    });
  } catch (e) {
    console.error("GET file error", e);
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const document = await prisma.document.findUnique({
      where: { id: params.id },
    });

    if (!document) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const isAuthorized =
      session.user.role === "ADMIN" ||
      (session.user.role === "ACCOUNTANT" &&
        (await prisma.accountantClient.findFirst({
          where: {
            accountantId: session.user.id,
            companyId: document.companyId,
          },
        })));

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Not authorized to delete this file" },
        { status: 403 }
      );
    }

    const abs = path.join(UPLOADS_ROOT, document.storagePath);
    if (!abs.startsWith(UPLOADS_ROOT)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    try {
      await unlink(abs);
    } catch (e) {
      console.error("Failed to delete file from disk:", e);
    }

    await prisma.document.delete({
      where: { id: params.id },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "DOCUMENT_DELETE",
        entity: "DOCUMENT",
        entityId: params.id,
        details: `Deleted ${document.filename} (${document.sizeBytes} bytes)`,
      },
    });

    return new Response(null, { status: 204 });
  } catch (e) {
    console.error("DELETE file error", e);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
