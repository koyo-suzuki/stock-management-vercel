import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|logout).*)'],
};

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get('authorization');

  // Get credentials from environment variables
  const adminUsername = process.env.BASIC_AUTH_USER || 'admin';
  const adminPassword = process.env.BASIC_AUTH_PASSWORD || 'password';
  const guestUsername = process.env.GUEST_AUTH_USER || 'guest';
  const guestPassword = process.env.GUEST_AUTH_PASSWORD || 'guest123';

  if (basicAuth) {
    try {
      const authValue = basicAuth.split(' ')[1];
      if (authValue) {
        const [user, pwd] = atob(authValue).split(':');

        // Check admin credentials
        if (user === adminUsername && pwd === adminPassword) {
          const response = NextResponse.next();
          response.headers.set('x-user-role', 'admin');
          return response;
        }

        // Check guest credentials
        if (user === guestUsername && pwd === guestPassword) {
          const response = NextResponse.next();
          response.headers.set('x-user-role', 'guest');
          return response;
        }
      }
    } catch (error) {
      // Invalid auth header format
    }
  }

  // Return 401 with WWW-Authenticate header
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}
