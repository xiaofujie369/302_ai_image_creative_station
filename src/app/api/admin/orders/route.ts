import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authError, requireAdmin } from "@/lib/server-auth";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as OrderStatus | null;
    const orders = await prisma.order.findMany({
      where: status ? { status } : undefined,
      include: { user: { select: { id: true, email: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return Response.json({ orders });
  } catch (error) {
    return authError(error);
  }
}
