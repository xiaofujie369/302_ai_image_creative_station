import { prisma } from "@/lib/prisma";
import { authError, requireAdmin } from "@/lib/server-auth";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const users = await prisma.user.findMany({
      where: q
        ? {
            OR: [
              { email: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return Response.json({ users });
  } catch (error) {
    return authError(error);
  }
}
