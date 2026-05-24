import { GenerationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authError, requireAdmin } from "@/lib/server-auth";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const user = searchParams.get("user");
    const model = searchParams.get("model");
    const status = searchParams.get("status") as GenerationStatus | null;
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const generations = await prisma.generationLog.findMany({
      where: {
        ...(model ? { model } : {}),
        ...(status ? { status } : {}),
        ...(from || to
          ? {
              createdAt: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
              },
            }
          : {}),
        ...(user
          ? {
              user: {
                OR: [
                  { email: { contains: user, mode: "insensitive" } },
                  { name: { contains: user, mode: "insensitive" } },
                ],
              },
            }
          : {}),
      },
      include: { user: { select: { id: true, email: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return Response.json({ generations });
  } catch (error) {
    return authError(error);
  }
}
