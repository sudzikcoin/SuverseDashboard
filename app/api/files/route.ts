import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import path from "path";
import { readFile } from "fs/promises";
import { UPLOADS_ROOT } from "@/lib/safeUpload";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const rel = searchParams.get("path");
    if (!rel) return NextResponse.json({ error: "Missing path" }, { status: 400 });

    const document = await prisma.document.findFirst({
      where: { storagePath: rel },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (session.user.role === "ACCOUNTANT") {
      const hasAccess = await prisma.accountantClient.findFirst({
        where: {
          accountantId: session.user.id,
          companyId: document.companyId,
        },
      });

      if (!hasAccess) {
        return NextResponse.json(
          { error: "You do not have access to this document" },
          { status: 403 }
        );
      }
    } else if (session.user.role === "COMPANY") {
      const userCompany = await prisma.company.findFirst({
        where: {
          users: {
            some: {
              id: session.user.id,
            },
          },
        },
      });

      if (!userCompany || userCompany.id !== document.companyId) {
        return NextResponse.json(
          { error: "You do not have access to this document" },
          { status: 403 }
        );
      }
    } else if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const abs = path.join(UPLOADS_ROOT, rel);
    if (!abs.startsWith(UPLOADS_ROOT)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const buf = await readFile(abs);
    const ext = path.extname(abs).toLowerCase();
    const type =
      ext === ".pdf" ? "application/pdf" :
      ext === ".png" ? "image/png" :
      ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" :
      "application/octet-stream";

    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type": type,
        "Cache-Control": "private, max-age=0",
      },
    });
  } catch (e) {
    console.error("FILES stream error", e);
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
