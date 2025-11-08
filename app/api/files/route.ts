import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function GET() {
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    if (!fs.existsSync(uploadDir)) {
      return NextResponse.json({ files: [] });
    }

    const files = fs.readdirSync(uploadDir).map((name) => {
      const filePath = path.join(uploadDir, name);
      const stats = fs.statSync(filePath);
      return {
        name,
        url: `/api/files/${encodeURIComponent(name)}`,
        size: stats.size,
        updatedAt: stats.mtime.toISOString(),
      };
    });

    files.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return NextResponse.json({ files });
  } catch (e: any) {
    console.error("List files error:", e);
    return NextResponse.json(
      { error: "Failed to list files", details: e?.message },
      { status: 500 }
    );
  }
}
