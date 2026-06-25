'use server';

import { auth } from '@/auth';
import { prisma } from './prisma';
import type { User } from '@/types';

/**
 * Get the current authenticated user from the NextAuth session.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  // Fetch full user data from DB
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!dbUser) {
    return null;
  }

  return {
    id: dbUser.id,
    name: dbUser.name,
    avatar: dbUser.avatar ?? dbUser.image,
    role: dbUser.role,
    bio: dbUser.bio,
    skills: dbUser.skills ? dbUser.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
    projectIds: [],
    createdAt: dbUser.createdAt.toISOString(),
  };
}

/**
 * Get just the session user ID (lightweight, no DB query).
 * Returns null if not authenticated.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
