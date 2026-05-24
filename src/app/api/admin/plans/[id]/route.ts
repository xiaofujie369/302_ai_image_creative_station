import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authError, requireAdmin } from "@/lib/server-auth";
import { recordAdminAudit } from "@/services/adminAuditService";

const schema = z.object({
  name: z.string().min(1).max(120).optional(),
  price: z.number().positive().optional(),
  currency: z.string().min(3).max(3).optional(),
  credits: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    const data = schema.parse(await request.json());
    const plan = await prisma.$transaction(async (tx) => {
      const updated = await tx.plan.update({ where: { id: params.id }, data });
      await recordAdminAudit(
        {
          adminUserId: admin.id,
          action: "plan.update",
          targetType: "plan",
          targetId: params.id,
          detail: data,
        },
        tx
      );
      return updated;
    });
    return Response.json({ plan });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.flatten() }, { status: 400 });
    }
    return authError(error);
  }
}
