import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { storeBytes } from "@/lib/storage";

export const dynamic = "force-dynamic";

const schema = z.object({
  type: z.string().min(1),
  companyId: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contentType = req.headers.get("content-type") || "";
  if (!contentType.startsWith("multipart/form-data"))
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });

  const form = await req.formData();
  const json = Object.fromEntries(form.entries());
  const parsed = schema.safeParse({
    type: json.type,
    companyId: json.companyId,
    notes: json.notes,
  });
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const arrayBuf = Buffer.from(await file.arrayBuffer());
  const m = file.type || "application/octet-stream";

  const stored = await storeBytes(arrayBuf, file.name, m);

  const doc = await prisma.document.create({
    data: {
      userId: parsed.data.companyId ? null : session.user.id,
      companyId: parsed.data.companyId || null,
      type: parsed.data.type,
      name: file.name,
      url: stored.url,
      storageKey: stored.storageKey,
      size: arrayBuf.length,
      mime: m,
      notes: parsed.data.notes || null,
    },
  });

  return NextResponse.json({ ok: true, document: doc });
}
