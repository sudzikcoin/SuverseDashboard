import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/ops/auth-middleware";
import { promises as fs } from "fs";
import path from "path";

const RUNTIME_DIR = path.join(process.cwd(), ".runtime");
const VERSION_FILE = path.join(RUNTIME_DIR, "session-version.json");

async function readVersionOverlay(): Promise<number> {
  try {
    const content = await fs.readFile(VERSION_FILE, "utf8");
    const data = JSON.parse(content);
    return data.version || 0;
  } catch {
    return 0;
  }
}

async function writeVersionOverlay(version: number): Promise<void> {
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
  await fs.writeFile(VERSION_FILE, JSON.stringify({ version, updatedAt: new Date().toISOString() }, null, 2));
}

export async function GET() {
  const adminError = await requireAdmin();
  if (adminError) return adminError;

  try {
    const overlayVersion = await readVersionOverlay();
    
    return NextResponse.json({
      ok: true,
      currentVersion: overlayVersion,
      note: "This version is used to invalidate all existing sessions when bumped",
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to read session version" },
      { status: 500 }
    );
  }
}

export async function POST() {
  const adminError = await requireAdmin();
  if (adminError) return adminError;

  try {
    const currentVersion = await readVersionOverlay();
    const newVersion = currentVersion + 1;
    
    await writeVersionOverlay(newVersion);
    
    console.log(`[shield:session] Version bumped from ${currentVersion} to ${newVersion} - all sessions will be invalidated`);
    
    return NextResponse.json({
      ok: true,
      previousVersion: currentVersion,
      newVersion: newVersion,
      message: "Session version bumped. All users will be logged out on next request.",
      action: "All existing session cookies will be cleared by middleware on next page load",
    });
  } catch (error: any) {
    console.error('[shield:session] Failed to bump version:', error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to bump session version" },
      { status: 500 }
    );
  }
}
