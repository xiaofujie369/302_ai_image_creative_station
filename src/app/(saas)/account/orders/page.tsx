import { AccountNav } from "@/components/saas/account-nav";
import { prisma } from "@/lib/prisma";
import { requirePageUser } from "@/lib/server-auth";

export default async function AccountOrdersPage() {
  const user = await requirePageUser();
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <AccountNav />
      <h1 className="mb-4 text-2xl font-semibold">My orders</h1>
      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3">Provider</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Credits</th>
              <th className="p-3">Status</th>
              <th className="p-3">Paid at</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t">
                <td className="p-3">{order.provider}</td>
                <td className="p-3">
                  {order.currency} {Number(order.amount).toFixed(2)}
                </td>
                <td className="p-3">{order.credits}</td>
                <td className="p-3">{order.status}</td>
                <td className="p-3">
                  {order.paidAt ? order.paidAt.toLocaleString() : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
