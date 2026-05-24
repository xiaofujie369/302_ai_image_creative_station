import { GenerationStatus, OrderStatus } from "@prisma/client";
import AdminShell from "@/components/saas/admin-shell";
import { prisma } from "@/lib/prisma";
import { requirePageAdmin } from "@/lib/server-auth";

export default async function AdminDashboardPage() {
  await requirePageAdmin();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [
    totalUsers,
    todayUsers,
    orderTotal,
    todayOrderTotal,
    totalGenerations,
    todayGenerations,
    failedGenerations,
    creditsAgg,
    recentOrders,
    recentGenerations,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: today } } }),
    prisma.order.aggregate({ where: { status: OrderStatus.PAID }, _sum: { amount: true } }),
    prisma.order.aggregate({
      where: { status: OrderStatus.PAID, paidAt: { gte: today } },
      _sum: { amount: true },
    }),
    prisma.generationLog.count(),
    prisma.generationLog.count({ where: { createdAt: { gte: today } } }),
    prisma.generationLog.count({ where: { status: GenerationStatus.FAILED } }),
    prisma.user.aggregate({ _sum: { credits: true } }),
    prisma.order.findMany({
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.generationLog.findMany({
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);
  const stats = [
    ["Total users", totalUsers],
    ["New users today", todayUsers],
    ["Total revenue", `$${Number(orderTotal._sum.amount || 0).toFixed(2)}`],
    ["Revenue today", `$${Number(todayOrderTotal._sum.amount || 0).toFixed(2)}`],
    ["Generations", totalGenerations],
    ["Generations today", todayGenerations],
    ["OpenAI failures", failedGenerations],
    ["Remaining credits", creditsAgg._sum.credits || 0],
  ];

  return (
    <AdminShell>
      <h1 className="mb-5 text-2xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={String(label)} className="rounded-lg border bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-600">{String(label)}</p>
            <p className="mt-2 text-2xl font-semibold">{String(value)}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="font-semibold">Recent orders</h2>
          <div className="mt-3 space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex justify-between text-sm">
                <span>{order.user.email}</span>
                <span>{order.status} · ${Number(order.amount).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="font-semibold">Recent generations</h2>
          <div className="mt-3 space-y-3">
            {recentGenerations.map((item) => (
              <div key={item.id} className="text-sm">
                <div className="flex justify-between">
                  <span>{item.user.email}</span>
                  <span>{item.status}</span>
                </div>
                <p className="line-clamp-1 text-slate-500">{item.prompt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
