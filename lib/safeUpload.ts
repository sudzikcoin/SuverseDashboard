import path from "path";
import { mkdir, stat, writeFile, rm } from "fs/promises";

export const UPLOADS_ROOT = path.join(process.cwd(), "uploads");

export async function ensureDir(dir: string) {
  try {
    await stat(dir);
  } catch {
    await mkdir(dir, { recursive: true });
  }
}

export function sanitizeFilename(name: string) {
  const base = name.normalize("NFKD").replace(/[^\w.\-]+/g, "_");
  return base.slice(0, 120);
}

export function buildPaths(companyId: string, fname: string) {
  const safe = sanitizeFilename(fname);
  const rel = path.join(companyId, `${Date.now()}_${safe}`);
  const abs = path.join(UPLOADS_ROOT, rel);
  return { rel, abs };
}

export async function saveBuffer(absPath: string, buf: Buffer) {
  await ensureDir(path.dirname(absPath));
  await writeFile(absPath, buf);
}

export async function removeAbs(absPath: string) {
  await rm(absPath, { force: true });
}
