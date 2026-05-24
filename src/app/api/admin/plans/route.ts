import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authError, requireAdmin } from "@/lib/server-auth";
import { recordAdminAudit } from "@/services/adminAuditService";

const schema = z.object({
  name: z.string().min(1).max(120),
  price: z.number().positive(),
  currency: z.string().min(3).max(3).default("USD"),
  credits: z.number().int().positive(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export async function GET() {
  try {
    await requireAdmin();
    const plans = await prisma.plan.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return Response.json({ plans });
  } catch (error) {
    return authError(error);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const data = schema.parse(await request.json());
    const plan = await prisma.$transaction(async (tx) => {
      const created = await tx.plan.create({ data });
      await recordAdminAudit(
        {
          adminUserId: admin.id,
          action: "plan.create",
          targetType: "plan",
          targetId: created.id,
          detail: data,
        },
        tx
      );
      return created;
    });
    return Response.json({ plan });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.flatten() }, { status: 400 });
    }
    return authError(error);
  }
}
