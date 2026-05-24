import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SETTINGS } from "@/lib/settings";
import { authError, requireAdmin } from "@/lib/server-auth";
import { recordAdminAudit } from "@/services/adminAuditService";

const schema = z.object({
  settings: z.record(z.string(), z.string().max(5000)),
});

export async function GET() {
  try {
    await requireAdmin();
    const rows = await prisma.systemSetting.findMany({ orderBy: { key: "asc" } });
    const existing = new Map(rows.map((row) => [row.key, row]));
    const settings = Object.entries(DEFAULT_SETTINGS).map(([key, value]) => ({
      key,
      value: existing.get(key)?.value ?? value,
      description: existing.get(key)?.description ?? "",
    }));
    return Response.json({ settings });
  } catch (error) {
    return authError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin();
    const { settings } = schema.parse(await request.json());
    await prisma.$transaction(async (tx) => {
      for (const [key, value] of Object.entries(settings)) {
        await tx.systemSetting.upsert({
          where: { key },
          update: { value },
          create: {
            key,
            value,
            description: DEFAULT_SETTINGS[key as keyof typeof DEFAULT_SETTINGS]
              ? key
              : "Custom setting",
          },
        });
      }
      await recordAdminAudit(
        {
          adminUserId: admin.id,
          action: "settings.update",
          targetType: "system_settings",
          detail: settings,
        },
        tx
      );
    });
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.flatten() }, { status: 400 });
    }
    return authError(error);
  }
}
