import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminPath = nextUrl.pathname.startsWith("/admin");
      
      if (isAdminPath) {
        if (isLoggedIn && auth.user?.role === "admin") return true;
        return false; // Redirect to login or handled by middleware later
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        if (session.user) {
          session.user.id = token.id as string;
          session.user.role = token.role as "admin" | "user";
        }
      }
      return session;
    },
  },
  providers: [], // Beállítás a main auth.ts-ben
  session: { strategy: "jwt" }, // JWT szükséges a middleware miatt
} satisfies NextAuthConfig;
