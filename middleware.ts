import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get('authorization');

  // Get credentials from environment variables
  const validUsername = process.env.BASIC_AUTH_USER || 'admin';
  const validPassword = process.env.BASIC_AUTH_PASSWORD || 'password';

  if (basicAuth) {
    try {
      const authValue = basicAuth.split(' ')[1];
      if (authValue) {
        const [user, pwd] = atob(authValue).split(':');

        if (user === validUsername && pwd === validPassword) {
          return NextResponse.next();
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
