// src/auth.ts
import NextAuth, { type NextAuthConfig } from "next-auth";
import type { AdapterUser } from "next-auth/adapters";
import type { JWT } from "next-auth/jwt";
import { UserRole, UserStatus } from "@prisma/client";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { type Adapter } from "@auth/core/adapters";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string | undefined)?.toLowerCase()?.trim();
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.hashedPassword) return null;
        if (user.status === "SUSPENDED") return null;
        if (!user.emailVerified) {
          throw new Error("Veuillez confirmer votre email avant de vous connecter.");
        }

        const valid = await bcrypt.compare(password, user.hashedPassword);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const authUser = user as AdapterUser & { role?: UserRole | null; status?: UserStatus };
        token.role = authUser.role ?? null;
        token.id = authUser.id;
        token.status = authUser.status ?? undefined;
      }

      if (typeof token.id === "string") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { role: true, status: true },
        });

        if (!dbUser) {
          token.id = undefined;
          token.role = undefined;
          token.status = UserStatus.SUSPENDED;
        } else {
          token.role = dbUser.role;
          token.status = dbUser.status;
        }
      }
      return token as JWT;
    },
    async session({ session, token }) {
      if (token.status === UserStatus.SUSPENDED) {
        return { ...session, user: undefined };
      }

      if (session.user) {
        session.user.id = typeof token.id === "string" ? token.id : session.user.id;
        session.user.role =
          (token.role as UserRole | null | undefined) ?? session.user.role ?? null;
        session.user.status =
          (token.status as UserStatus | undefined) ?? session.user.status ?? undefined;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/admin")) return `${baseUrl}/admin`;
      if (url.startsWith("/dashboard/owner"))
        return `${baseUrl}/dashboard/owner`;
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
