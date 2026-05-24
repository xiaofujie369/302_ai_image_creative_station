import Link from "next/link";
import AdminShell from "@/components/saas/admin-shell";
import { AdminCreditForm, AdminUserActions } from "@/components/saas/admin-user-actions";
import { prisma } from "@/lib/prisma";
import { requirePageAdmin } from "@/lib/server-auth";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  await requirePageAdmin();
  const q = searchParams.q?.trim();
  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <AdminShell>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Users</h1>
        <form className="flex gap-2">
          <input name="q" defaultValue={q} placeholder="Search email/name" className="rounded-md border px-3 py-2 text-sm" />
          <button className="rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white">Search</button>
        </form>
      </div>
      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Credits</th>
              <th className="p-3">Actions</th>
              <th className="p-3">Adjust credits</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t align-top">
                <td className="p-3">
                  <Link href={`/admin/users/${user.id}`} className="font-medium underline">
                    {user.email || user.name || user.id}
                  </Link>
                  <p className="text-xs text-slate-500">{user.createdAt.toLocaleString()}</p>
                </td>
                <td className="p-3">{user.role}</td>
                <td className="p-3">{user.status}</td>
                <td className="p-3">{user.credits}</td>
                <td className="p-3">
                  <AdminUserActions userId={user.id} role={user.role} status={user.status} />
                </td>
                <td className="p-3">
                  <AdminCreditForm userId={user.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
