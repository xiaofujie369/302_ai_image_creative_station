import { prisma } from "@/lib/prisma";
import { authError, requireUser } from "@/lib/server-auth";

export async function GET() {
  try {
    const user = await requireUser();
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return Response.json({ orders });
  } catch (error) {
    return authError(error);
  }
}
