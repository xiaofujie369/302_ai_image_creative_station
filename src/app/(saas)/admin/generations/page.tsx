import AdminShell from "@/components/saas/admin-shell";
import DeleteGenerationButton from "@/components/saas/delete-generation-button";
import { prisma } from "@/lib/prisma";
import { requirePageAdmin } from "@/lib/server-auth";

export default async function AdminGenerationsPage({
  searchParams,
}: {
  searchParams: { status?: string; model?: string; user?: string; from?: string; to?: string };
}) {
  await requirePageAdmin();
  const generations = await prisma.generationLog.findMany({
    where: {
      ...(searchParams.status ? { status: searchParams.status as any } : {}),
      ...(searchParams.model ? { model: searchParams.model } : {}),
      ...(searchParams.from || searchParams.to
        ? {
            createdAt: {
              ...(searchParams.from ? { gte: new Date(searchParams.from) } : {}),
              ...(searchParams.to ? { lte: new Date(searchParams.to) } : {}),
            },
          }
        : {}),
      ...(searchParams.user
        ? {
            user: {
              OR: [
                { email: { contains: searchParams.user, mode: "insensitive" } },
                { name: { contains: searchParams.user, mode: "insensitive" } },
              ],
            },
          }
        : {}),
    },
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <AdminShell>
      <h1 className="mb-5 text-2xl font-semibold">Generation records</h1>
      <form className="mb-4 flex flex-wrap gap-2">
        <input name="user" defaultValue={searchParams.user} placeholder="User" className="rounded-md border px-3 py-2 text-sm" />
        <input name="model" defaultValue={searchParams.model} placeholder="Model" className="rounded-md border px-3 py-2 text-sm" />
        <input name="from" type="date" defaultValue={searchParams.from} className="rounded-md border px-3 py-2 text-sm" />
        <input name="to" type="date" defaultValue={searchParams.to} className="rounded-md border px-3 py-2 text-sm" />
        <select name="status" defaultValue={searchParams.status || ""} className="rounded-md border px-3 py-2 text-sm">
          <option value="">All status</option>
          <option value="PENDING">Pending</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
        </select>
        <button className="rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white">Filter</button>
      </form>
      <div className="grid gap-4">
        {generations.map((item) => (
          <div key={item.id} className="grid gap-4 rounded-lg border bg-white p-4 shadow-sm md:grid-cols-[120px_1fr_auto]">
            {item.outputImageUrl ? (
              <img src={item.outputImageUrl} alt="" className="h-28 w-28 rounded-md border object-cover" />
            ) : (
              <div className="h-28 w-28 rounded-md bg-slate-100" />
            )}
            <div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                <span>{item.user.email}</span>
                <span>{item.model}</span>
                <span>{item.mode}</span>
                <span>{item.status}</span>
                <span>{item.createdAt.toLocaleString()}</span>
              </div>
              <p className="mt-2 text-sm">{item.prompt}</p>
              {item.errorMessage && <p className="mt-2 text-sm text-red-600">{item.errorMessage}</p>}
            </div>
            <DeleteGenerationButton id={item.id} />
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
