import { headers } from 'next/headers';
import { resolveRoleFromAuthHeader } from './basic-auth';
import type { UserRole } from './basic-auth';

export type { UserRole } from './basic-auth';

export async function getUserRole(): Promise<UserRole> {
  const headersList = await headers();
  return resolveRoleFromAuthHeader(headersList.get('authorization')) || 'guest';
}

export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'admin';
}

export async function isGuest(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'guest';
}
