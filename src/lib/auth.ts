import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import {
  CreditTransactionType,
  UserRole,
  UserStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { asBoolean, getSetting } from "@/lib/settings";

export function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

async function initializeNewUser(userId: string, email?: string | null) {
  const [userCount, signupBonusRaw] = await Promise.all([
    prisma.user.count(),
    getSetting("signup.bonus_credits"),
  ]);
  const adminEmails = getAdminEmails();
  const isAdmin =
    Boolean(email && adminEmails.includes(email.toLowerCase())) ||
    userCount <= 1;
  const signupBonus = Math.max(
    0,
    Number(process.env.SIGNUP_BONUS_CREDITS || signupBonusRaw || 0)
  );

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const alreadyBonused = await tx.creditTransaction.findFirst({
      where: { userId, type: CreditTransactionType.SIGNUP_BONUS },
      select: { id: true },
    });

    const credits = alreadyBonused ? user.credits : user.credits + signupBonus;
    await tx.user.update({
      where: { id: userId },
      data: {
        role: isAdmin ? UserRole.ADMIN : user.role,
        credits,
      },
    });

    if (!alreadyBonused && signupBonus > 0) {
      await tx.creditTransaction.create({
        data: {
          userId,
          type: CreditTransactionType.SIGNUP_BONUS,
          amount: signupBonus,
          balanceAfter: credits,
          description: "Signup bonus credits",
        },
      });
    }
  });
}

const providers: NextAuthOptions["providers"] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

if (process.env.EMAIL_SERVER && process.env.EMAIL_FROM) {
  providers.push(
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (
        account?.provider === "google" &&
        !asBoolean(await getSetting("auth.google_enabled"), true)
      ) {
        return false;
      }
      if (
        account?.provider === "email" &&
        !asBoolean(await getSetting("auth.email_enabled"), true)
      ) {
        return false;
      }
      if (!user.email) return false;
      const existing = await prisma.user.findUnique({
        where: { email: user.email.toLowerCase() },
        select: { status: true },
      });
      if (existing?.status === UserStatus.BANNED) return false;
      if (!existing) {
        return asBoolean(await getSetting("auth.registration_enabled"), true);
      }
      return true;
    },
    async jwt({ token }) {
      if (token.email) {
        const user = await prisma.user.findUnique({
          where: { email: token.email.toLowerCase() },
          select: { id: true, role: true, credits: true, status: true, image: true },
        });
        if (user) {
          token.id = user.id;
          token.role = user.role;
          token.credits = user.credits;
          token.status = user.status;
          token.picture = user.image ?? token.picture;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.credits = Number(token.credits || 0);
        session.user.status = token.status as UserStatus;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      await initializeNewUser(user.id, user.email);
    },
  },
};
