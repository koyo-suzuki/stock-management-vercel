export type UserRole = 'admin' | 'guest';

function constantTimeEqual(actual: string, expected: string): boolean {
  let difference = actual.length ^ expected.length;

  // The configured value fixes the loop count, regardless of input length or
  // where a mismatch occurs. Never return early for a length mismatch.
  for (let index = 0; index < expected.length; index += 1) {
    difference |= (actual.charCodeAt(index) | 0) ^ expected.charCodeAt(index);
  }

  return difference === 0;
}

export function isAuthConfigured(): boolean {
  return Boolean(process.env.BASIC_AUTH_USER && process.env.BASIC_AUTH_PASSWORD);
}

export function resolveRoleFromAuthHeader(authHeader: string | null): UserRole | null {
  if (!isAuthConfigured() || !authHeader) {
    return null;
  }

  const match = /^Basic[ \t]+([A-Za-z0-9+/]+={0,2})[ \t]*$/i.exec(authHeader);
  if (!match) {
    return null;
  }

  let credentials: string;
  try {
    const decoded = atob(match[1]);
    const bytes = Uint8Array.from(decoded, (character) => character.charCodeAt(0));
    credentials = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return null;
  }

  const separator = credentials.indexOf(':');
  if (separator === -1) {
    return null;
  }

  const username = credentials.slice(0, separator);
  const password = credentials.slice(separator + 1);
  const adminUsername = process.env.BASIC_AUTH_USER || '';
  const adminPassword = process.env.BASIC_AUTH_PASSWORD || '';
  const guestUsername = process.env.GUEST_AUTH_USER || '';
  const guestPassword = process.env.GUEST_AUTH_PASSWORD || '';

  // Evaluate every comparison before selecting a role; no credential comparison
  // is skipped because another field or role failed to match.
  const adminUserMatches = constantTimeEqual(username, adminUsername);
  const adminPasswordMatches = constantTimeEqual(password, adminPassword);
  const guestUserMatches = constantTimeEqual(username, guestUsername);
  const guestPasswordMatches = constantTimeEqual(password, guestPassword);

  if (adminUserMatches && adminPasswordMatches) {
    return 'admin';
  }

  if (guestUsername && guestPassword && guestUserMatches && guestPasswordMatches) {
    return 'guest';
  }

  return null;
}
