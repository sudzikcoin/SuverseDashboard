import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true, repaired: true });
  res.cookies.delete("next-auth.session-token");
  res.cookies.delete("__Secure-next-auth.session-token");
  res.cookies.delete("sv.session.v2");
  return res;
}
