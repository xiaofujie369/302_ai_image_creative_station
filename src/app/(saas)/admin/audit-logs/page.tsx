import AdminShell from "@/components/saas/admin-shell";
import { prisma } from "@/lib/prisma";
import { requirePageAdmin } from "@/lib/server-auth";

export default async function AdminAuditLogsPage() {
  await requirePageAdmin();
  const logs = await prisma.adminAuditLog.findMany({
    include: { adminUser: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <AdminShell>
      <h1 className="mb-5 text-2xl font-semibold">Admin audit logs</h1>
      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3">Admin</th>
              <th className="p-3">Action</th>
              <th className="p-3">Target</th>
              <th className="p-3">Detail</th>
              <th className="p-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t align-top">
                <td className="p-3">{log.adminUser.email}</td>
                <td className="p-3">{log.action}</td>
                <td className="p-3">{log.targetType}:{log.targetId || "-"}</td>
                <td className="p-3"><pre className="max-w-md whitespace-pre-wrap text-xs">{JSON.stringify(log.detail, null, 2)}</pre></td>
                <td className="p-3">{log.createdAt.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
