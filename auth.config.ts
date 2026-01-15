import type { NextAuthConfig } from 'next-auth';

// Allowed email addresses or domains
// Add your email addresses here
const ALLOWED_EMAILS = process.env.ALLOWED_EMAILS?.split(',').map(e => e.trim()) || [];

// Check if email is allowed
function isEmailAllowed(email: string | null | undefined): boolean {
  if (!email) return false;

  // Check if email is in the allowed list
  if (ALLOWED_EMAILS.includes(email)) return true;

  // Check if email domain is allowed (e.g., @company.com)
  const domain = email.split('@')[1];
  const allowedDomain = ALLOWED_EMAILS.find(e => e.startsWith('@'));
  if (allowedDomain && domain === allowedDomain.substring(1)) return true;

  return false;
}

export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login/error',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow sign in only if email is in the allowed list
      if (user.email && isEmailAllowed(user.email)) {
        return true;
      }

      // Reject sign in - will redirect to error page
      return false;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnLogin = nextUrl.pathname.startsWith('/login');

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn && isOnLogin) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
