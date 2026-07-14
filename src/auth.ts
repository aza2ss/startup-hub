import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || 'missing-google-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'missing-google-secret',
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID || 'missing-github-id',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'missing-github-secret',
    }),
  ],
  callbacks: {
    session({ session, user }) {
      // Expose user.id in session so we can use it in server actions
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
});
