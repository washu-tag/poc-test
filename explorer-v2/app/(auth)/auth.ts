import { compare } from 'bcrypt-ts';
import NextAuth, { User, Session } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';

import { getUser } from '@/db/queries';

import { authConfig } from './auth.config';

export interface ExtendedSession extends Session {
  user: User;
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {},
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string };
        const users = await getUser(email);
        if (users.length === 0) return null;
        const passwordsMatch = await compare(password, users[0].password!);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (passwordsMatch) return users[0] as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },
    async session({ session, token }: { session: ExtendedSession; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
      }

      return session;
    },
  },
});
