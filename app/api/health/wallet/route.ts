import { NextResponse } from "next/server";
import { getWalletEnv } from "@/lib/env";

export async function GET() {
  const { projectId } = getWalletEnv();
  return NextResponse.json({
    ok: Boolean(projectId && projectId !== "MISSING"),
    projectIdPresent: Boolean(projectId),
    length: projectId?.length ?? 0,
  });
}
