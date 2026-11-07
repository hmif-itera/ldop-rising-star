import type { NextAuthConfig } from "next-auth";

export default {
  trustHost: true,
  providers: [],
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.picture = user.image ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.image = (token.picture as string | null) ?? null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
