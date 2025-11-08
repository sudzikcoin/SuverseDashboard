import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

function getMimeByExt(filename: string) {
  const ext = filename.toLowerCase().split(".").pop() || "";
  const map: Record<string, string> = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    txt: "text/plain",
  };
  return map[ext] || "application/octet-stream";
}

export async function GET(
  _req: Request,
  { params }: { params: { name: string } }
) {
  const name = decodeURIComponent(params.name);
  const filePath = path.join(process.cwd(), "public", "uploads", name);
  
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
  
  const data = fs.readFileSync(filePath);
  const res = new NextResponse(data);
  res.headers.set("Content-Type", getMimeByExt(name));
  res.headers.set("Content-Disposition", `inline; filename="${name}"`);
  return res;
}

export async function DELETE(
  _req: Request,
  { params }: { params: { name: string } }
) {
  const name = decodeURIComponent(params.name);
  const filePath = path.join(process.cwd(), "public", "uploads", name);
  
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
  
  fs.unlinkSync(filePath);
  return new NextResponse(null, { status: 204 });
}
