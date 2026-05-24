import Link from "next/link";
import AccountNav from "@/components/saas/account-nav";
import { prisma } from "@/lib/prisma";
import { requirePageUser } from "@/lib/server-auth";

export default async function AccountPage() {
  const user = await requirePageUser();
  const [generations, orders, transactions] = await Promise.all([
    prisma.generationLog.count({ where: { userId: user.id } }),
    prisma.order.count({ where: { userId: user.id } }),
    prisma.creditTransaction.count({ where: { userId: user.id } }),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <AccountNav />
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-600">Credits</p>
          <p className="mt-2 text-3xl font-semibold">{user.credits}</p>
        </div>
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-600">Generations</p>
          <p className="mt-2 text-3xl font-semibold">{generations}</p>
        </div>
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-600">Orders</p>
          <p className="mt-2 text-3xl font-semibold">{orders}</p>
        </div>
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-600">Transactions</p>
          <p className="mt-2 text-3xl font-semibold">{transactions}</p>
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <Link className="rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white" href="/generate">
          Generate
        </Link>
        <Link className="rounded-md border bg-white px-4 py-3 text-sm font-semibold" href="/pricing">
          Buy credits
        </Link>
      </div>
    </main>
  );
}
