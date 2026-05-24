import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { UserRole, UserStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  return prisma.user.findUnique({
    where: { id: session.user.id },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }
  if (user.status === UserStatus.BANNED) {
    throw new Response("Account banned", { status: 403 });
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== UserRole.ADMIN) {
    throw new Response("Forbidden", { status: 403 });
  }
  return user;
}

export async function requirePageUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.status === UserStatus.BANNED) redirect("/login?error=banned");
  return user;
}

export async function requirePageAdmin() {
  const user = await requirePageUser();
  if (user.role !== UserRole.ADMIN) redirect("/account");
  return user;
}

export function authError(error: unknown) {
  if (error instanceof Response) return error;
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
