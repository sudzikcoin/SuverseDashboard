export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email/send';

export async function POST(req: Request) {
  try {
    const { to, name } = await req.json();
    if (!to) return NextResponse.json({ ok: false, error: 'Missing "to"' }, { status: 400 });
    const r = await sendWelcomeEmail(to, name);
    return NextResponse.json(r, { status: r.ok ? 200 : 500 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}
