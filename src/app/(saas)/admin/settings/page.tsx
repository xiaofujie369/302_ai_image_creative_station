import AdminShell from "@/components/saas/admin-shell";
import AdminSettingsForm from "@/components/saas/admin-settings-form";
import { DEFAULT_SETTINGS } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { requirePageAdmin } from "@/lib/server-auth";

export default async function AdminSettingsPage() {
  await requirePageAdmin();
  const rows = await prisma.systemSetting.findMany({ orderBy: { key: "asc" } });
  const existing = new Map(rows.map((row) => [row.key, row]));
  const settings = Object.entries(DEFAULT_SETTINGS).map(([key, fallback]) => ({
    key,
    value: existing.get(key)?.value ?? fallback,
    description: existing.get(key)?.description ?? "",
  }));

  return (
    <AdminShell>
      <h1 className="mb-5 text-2xl font-semibold">System settings</h1>
      <AdminSettingsForm initial={settings} />
    </AdminShell>
  );
}
