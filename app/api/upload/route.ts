import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as unknown as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    ensureDir(uploadDir);

    const safeName = file.name.replace(/[/\\]/g, "_");
    const filePath = path.join(uploadDir, safeName);

    fs.writeFileSync(filePath, buffer);

    return NextResponse.json(
      {
        success: true,
        name: safeName,
        url: `/api/files/${encodeURIComponent(safeName)}`,
        size: file.size,
        mime: file.type || "application/octet-stream",
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
