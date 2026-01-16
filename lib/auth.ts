import { headers } from 'next/headers';

export type UserRole = 'admin' | 'guest';

export async function getUserRole(): Promise<UserRole> {
  const headersList = await headers();
  const role = headersList.get('x-user-role');
  return (role as UserRole) || 'guest';
}

export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'admin';
}

export async function isGuest(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'guest';
}
