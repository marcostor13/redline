import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE, verifyToken } from '@/lib/auth';

const PUBLIC = ['/login', '/api/auth/login', '/api/leads'];

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC.some((p) => pathname === p || (p === '/api/leads' && pathname.startsWith('/api/leads') && req.method === 'POST'));
  if (isPublic) return NextResponse.next();

  const token = req.cookies.get(COOKIE)?.value;
  if (!token || !(await verifyToken(token))) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
