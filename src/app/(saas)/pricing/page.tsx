import CheckoutButton from "@/components/saas/checkout-button";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const [plans, user] = await Promise.all([
    prisma.plan.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { price: "asc" }],
    }),
    getCurrentUser(),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold">Buy credits</h1>
        <p className="mt-3 text-slate-600">
          Plans are loaded from the database and can be changed in the admin console.
        </p>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.id} className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">{plan.name}</h2>
            <p className="mt-4 text-4xl font-semibold">
              ${Number(plan.price).toFixed(2)}
            </p>
            <p className="mt-2 text-slate-600">{plan.credits} credits</p>
            <div className="mt-6">
              {user ? (
                <CheckoutButton planId={plan.id} />
              ) : (
                <a
                  href="/login"
                  className="block rounded-md bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  Sign in to buy
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
