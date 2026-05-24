import AccountNav from "@/components/saas/account-nav";
import { prisma } from "@/lib/prisma";
import { requirePageUser } from "@/lib/server-auth";

export default async function AccountCreditsPage() {
  const user = await requirePageUser();
  const transactions = await prisma.creditTransaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <AccountNav />
      <div className="mb-4 rounded-lg border bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-600">Current balance</p>
        <p className="mt-2 text-3xl font-semibold">{user.credits} credits</p>
      </div>
      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3">Type</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Balance</th>
              <th className="p-3">Description</th>
              <th className="p-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-3">{item.type}</td>
                <td className="p-3">{item.amount}</td>
                <td className="p-3">{item.balanceAfter}</td>
                <td className="p-3">{item.description || "-"}</td>
                <td className="p-3">{item.createdAt.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
