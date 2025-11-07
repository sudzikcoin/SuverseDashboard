import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UPLOADS_ROOT, buildPaths, saveBuffer, removeAbs } from "@/lib/safeUpload";
import path from "path";
import { stat } from "fs/promises";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = new Set(["application/pdf", "image/png", "image/jpeg"]);
const MAX_BYTES = 10 * 1024 * 1024;

function bad(msg: string, code = 400) {
  return NextResponse.json({ error: msg }, { status: code });
}

export async function GET(
  _req: Request,
  { params }: { params: { companyId: string } }
) {
  const { companyId } = params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return bad("Unauthorized", 401);
    }

    if (session.user.role !== "ACCOUNTANT" && session.user.role !== "ADMIN") {
      return bad("Forbidden", 403);
    }

    if (session.user.role === "ACCOUNTANT") {
      const hasAccess = await prisma.accountantClient.findFirst({
        where: {
          accountantId: session.user.id,
          companyId,
        },
      });

      if (!hasAccess) {
        return bad("You do not have access to this company", 403);
      }
    }

    const docs = await prisma.document.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "READ",
        entity: "Document",
        entityId: companyId,
        details: `Viewed ${docs.length} documents for company ${companyId}`,
      },
    });

    const withUrls = docs.map((d) => ({
      ...d,
      url: `/api/files?path=${encodeURIComponent(d.storagePath)}`,
    }));

    return NextResponse.json({ items: withUrls });
  } catch (e) {
    console.error("GET documents error", e);
    return bad("Failed to list documents", 500);
  }
}

export async function POST(
  req: Request,
  { params }: { params: { companyId: string } }
) {
  const { companyId } = params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return bad("Unauthorized", 401);
    }

    if (session.user.role !== "ACCOUNTANT" && session.user.role !== "ADMIN") {
      return bad("Forbidden", 403);
    }

    if (session.user.role === "ACCOUNTANT") {
      const hasAccess = await prisma.accountantClient.findFirst({
        where: {
          accountantId: session.user.id,
          companyId,
        },
      });

      if (!hasAccess) {
        return bad("You do not have access to this company", 403);
      }
    }

    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("multipart/form-data")) {
      return bad("Content-Type must be multipart/form-data");
    }

    const form = await req.formData();
    const files = form.getAll("file");
    if (!files.length) return bad("No files provided");

    const created: any[] = [];

    for (const anyFile of files) {
      const file = anyFile as File;
      if (typeof file?.arrayBuffer !== "function") continue;

      const mime = file.type || "application/octet-stream";
      if (!ALLOWED.has(mime)) {
        return bad("Only PDF/PNG/JPG are allowed");
      }
      if (file.size > MAX_BYTES) {
        return bad("File too large (max 10 MB)");
      }

      const { rel, abs } = buildPaths(companyId, file.name);
      if (!abs.startsWith(path.join(UPLOADS_ROOT, companyId))) {
        return bad("Invalid path");
      }

      const buf = Buffer.from(await file.arrayBuffer());
      await saveBuffer(abs, buf);

      const doc = await prisma.document.create({
        data: {
          companyId,
          filename: file.name,
          mimeType: mime,
          sizeBytes: file.size,
          storagePath: path.join(companyId, path.basename(abs)),
          uploadedById: session.user.id,
        },
      });

      await prisma.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "CREATE",
          entity: "Document",
          entityId: doc.id,
          details: `Uploaded ${file.name} (${file.size} bytes) for company ${companyId}`,
        },
      });

      created.push({
        ...doc,
        url: `/api/files?path=${encodeURIComponent(doc.storagePath)}`,
      });
    }

    return NextResponse.json({ items: created }, { status: 201 });
  } catch (e) {
    console.error("UPLOAD error", e);
    return bad("Failed to upload document", 500);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { companyId: string } }
) {
  const { companyId } = params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return bad("Unauthorized", 401);
    }

    if (session.user.role !== "ACCOUNTANT" && session.user.role !== "ADMIN") {
      return bad("Forbidden", 403);
    }

    if (session.user.role === "ACCOUNTANT") {
      const hasAccess = await prisma.accountantClient.findFirst({
        where: {
          accountantId: session.user.id,
          companyId,
        },
      });

      if (!hasAccess) {
        return bad("You do not have access to this company", 403);
      }
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return bad("Missing id");

    const doc = await prisma.document.findFirst({ where: { id, companyId } });
    if (!doc) return bad("Not found", 404);

    const abs = path.join(UPLOADS_ROOT, doc.storagePath);
    try {
      await stat(abs);
      await removeAbs(abs);
    } catch {
      // file may already be gone
    }

    await prisma.document.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "DELETE",
        entity: "Document",
        entityId: id,
        details: `Deleted ${doc.filename} for company ${companyId}`,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE document error", e);
    return bad("Failed to delete document", 500);
  }
}
