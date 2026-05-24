import AdminShell from "@/components/saas/admin-shell";
import { AdminCreditForm, AdminUserActions } from "@/components/saas/admin-user-actions";
import { prisma } from "@/lib/prisma";
import { requirePageAdmin } from "@/lib/server-auth";

export default async function AdminUserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requirePageAdmin();
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      creditTransactions: { orderBy: { createdAt: "desc" }, take: 25 },
      generationLogs: { orderBy: { createdAt: "desc" }, take: 25 },
      orders: { orderBy: { createdAt: "desc" }, take: 25 },
    },
  });

  if (!user) {
    return (
      <AdminShell>
        <p>User not found.</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <h1 className="mb-5 text-2xl font-semibold">{user.email || user.id}</h1>
      <div className="mb-6 rounded-lg border bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-4">
          <div><p className="text-xs text-slate-500">Role</p><p>{user.role}</p></div>
          <div><p className="text-xs text-slate-500">Status</p><p>{user.status}</p></div>
          <div><p className="text-xs text-slate-500">Credits</p><p>{user.credits}</p></div>
          <div><p className="text-xs text-slate-500">Created</p><p>{user.createdAt.toLocaleString()}</p></div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <AdminUserActions userId={user.id} role={user.role} status={user.status} />
          <AdminCreditForm userId={user.id} />
        </div>
      </div>
      <Section title="Credit transactions">
        {user.creditTransactions.map((item) => (
          <Row key={item.id} left={`${item.type} · ${item.amount}`} right={`${item.balanceAfter} credits`} />
        ))}
      </Section>
      <Section title="Generations">
        {user.generationLogs.map((item) => (
          <Row key={item.id} left={`${item.status} · ${item.model}`} right={item.prompt} />
        ))}
      </Section>
      <Section title="Orders">
        {user.orders.map((item) => (
          <Row key={item.id} left={`${item.status} · ${item.provider}`} right={`$${Number(item.amount).toFixed(2)} / ${item.credits} credits`} />
        ))}
      </Section>
    </AdminShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-lg border bg-white p-5 shadow-sm">
      <h2 className="mb-3 font-semibold">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ left, right }: { left: string; right: string }) {
  return (
    <div className="flex justify-between gap-4 border-t pt-2 text-sm">
      <span>{left}</span>
      <span className="max-w-xl truncate text-slate-500">{right}</span>
    </div>
  );
}
