import Link from "next/link";
import { ImageIcon, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const features = [
    { label: "Server-only keys", Icon: ShieldCheck },
    { label: "Credit billing", Icon: WalletCards },
    { label: "Image history", Icon: ImageIcon },
  ];
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { price: "asc" }],
    take: 3,
  });

  return (
    <main>
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-sm text-slate-600">
            <Sparkles className="h-4 w-4" />
            GPT Image SaaS for creators, shops, and teams
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-slate-950 sm:text-6xl">
            AI Image Creative Station
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Generate, edit, restyle, and manage AI images with account credits,
            purchase plans, server-side OpenAI calls, and a full admin console.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/generate"
              className="rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm"
            >
              Start generating
            </Link>
            <Link
              href="/pricing"
              className="rounded-md border bg-white px-5 py-3 text-sm font-semibold"
            >
              Buy credits
            </Link>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {features.map(({ label, Icon }) => (
              <div key={label} className="rounded-lg border bg-white p-4">
                <Icon className="mb-3 h-5 w-5" />
                <p className="text-sm font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-4">
          <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
            <img
              src="/images/global/desc_en.png"
              alt="AI image examples"
              className="h-auto w-full"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {plans.map((plan) => (
              <div key={plan.id} className="rounded-lg border bg-white p-4">
                <p className="text-sm font-medium">{plan.name}</p>
                <p className="mt-2 text-2xl font-semibold">{plan.credits}</p>
                <p className="text-xs text-slate-500">credits</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
