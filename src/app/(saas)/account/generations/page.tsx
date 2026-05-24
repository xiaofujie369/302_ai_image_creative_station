import { AccountNav } from "@/components/saas/account-nav";
import { prisma } from "@/lib/prisma";
import { requirePageUser } from "@/lib/server-auth";

export default async function AccountGenerationsPage() {
  const user = await requirePageUser();
  const generations = await prisma.generationLog.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <AccountNav />
      <h1 className="mb-4 text-2xl font-semibold">My generations</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {generations.map((item) => (
          <div key={item.id} className="rounded-lg border bg-white p-4 shadow-sm">
            {item.outputImageUrl && (
              <img src={item.outputImageUrl} alt="" className="mb-3 rounded-md border" />
            )}
            <p className="line-clamp-3 text-sm">{item.prompt}</p>
            <div className="mt-3 flex justify-between text-xs text-slate-500">
              <span>{item.model}</span>
              <span>{item.status}</span>
            </div>
            {item.errorMessage && (
              <p className="mt-2 text-xs text-red-600">{item.errorMessage}</p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
