export function safeInt(v: unknown, d = 0): number {
  const n = typeof v === "string" ? Number(v) : (v as number);
  if (!Number.isFinite(n)) return d;
  return Math.trunc(n);
}

export function safeNum(v: unknown, d = 0): number {
  const n = typeof v === "string" ? Number(v) : (v as number);
  return Number.isFinite(n) ? n : d;
}

export function safeFixed(v: unknown, frac = 2): string {
  const n = safeNum(v, 0);
  const f = Math.max(0, Math.min(6, Math.trunc(safeNum(frac, 2))));
  return n.toFixed(f);
}
