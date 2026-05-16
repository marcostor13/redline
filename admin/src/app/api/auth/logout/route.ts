import { NextResponse } from 'next/server';
import { COOKIE } from '@/lib/auth';

export async function POST(): Promise<NextResponse> {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE);
  return res;
}
