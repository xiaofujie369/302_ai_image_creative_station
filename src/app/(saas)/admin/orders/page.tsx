import AdminShell from "@/components/saas/admin-shell";
import { prisma } from "@/lib/prisma";
import { requirePageAdmin } from "@/lib/server-auth";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  await requirePageAdmin();
  const orders = await prisma.order.findMany({
    where: searchParams.status ? { status: searchParams.status as any } : undefined,
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <AdminShell>
      <h1 className="mb-5 text-2xl font-semibold">Orders</h1>
      <form className="mb-4 flex gap-2">
        <select name="status" defaultValue={searchParams.status || ""} className="rounded-md border px-3 py-2 text-sm">
          <option value="">All status</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
        <button className="rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white">Filter</button>
      </form>
      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Provider order</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Credits</th>
              <th className="p-3">Status</th>
              <th className="p-3">Paid at</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t">
                <td className="p-3">{order.user.email}</td>
                <td className="p-3">{order.providerOrderId || "-"}</td>
                <td className="p-3">{order.currency} {Number(order.amount).toFixed(2)}</td>
                <td className="p-3">{order.credits}</td>
                <td className="p-3">{order.status}</td>
                <td className="p-3">{order.paidAt ? order.paidAt.toLocaleString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
