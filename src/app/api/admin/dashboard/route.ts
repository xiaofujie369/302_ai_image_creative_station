import { GenerationStatus, OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authError, requireAdmin } from "@/lib/server-auth";

export async function GET() {
  try {
    await requireAdmin();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      todayUsers,
      totalOrders,
      todayOrders,
      totalGenerations,
      todayGenerations,
      failedGenerations,
      creditsAgg,
      recentOrders,
      recentGenerations,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.order.aggregate({
        where: { status: OrderStatus.PAID },
        _sum: { amount: true },
      }),
      prisma.order.aggregate({
        where: { status: OrderStatus.PAID, paidAt: { gte: today } },
        _sum: { amount: true },
      }),
      prisma.generationLog.count(),
      prisma.generationLog.count({ where: { createdAt: { gte: today } } }),
      prisma.generationLog.count({ where: { status: GenerationStatus.FAILED } }),
      prisma.user.aggregate({ _sum: { credits: true } }),
      prisma.order.findMany({
        include: { user: { select: { email: true, name: true } } },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.generationLog.findMany({
        include: { user: { select: { email: true, name: true } } },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

    return Response.json({
      metrics: {
        totalUsers,
        todayUsers,
        totalOrderAmount: Number(totalOrders._sum.amount || 0),
        todayOrderAmount: Number(todayOrders._sum.amount || 0),
        totalGenerations,
        todayGenerations,
        failedGenerations,
        totalRemainingCredits: creditsAgg._sum.credits || 0,
      },
      recentOrders,
      recentGenerations,
    });
  } catch (error) {
    return authError(error);
  }
}
