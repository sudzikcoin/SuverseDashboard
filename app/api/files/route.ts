import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
