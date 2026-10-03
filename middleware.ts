import { NextRequest, NextResponse } from 'next/server';
import { isAuthConfigured, resolveRoleFromAuthHeader } from './lib/basic-auth';

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|logout).*)'],
};

export function middleware(req: NextRequest) {
  if (!isAuthConfigured()) {
    return new NextResponse('認証が設定されていません', { status: 500 });
  }

  const role = resolveRoleFromAuthHeader(req.headers.get('authorization'));
  if (role !== null) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.delete('x-user-role');
    requestHeaders.set('x-user-role', role);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Return 401 with WWW-Authenticate header
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}
