import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authError, requireAdmin } from "@/lib/server-auth";
import { adminAdjustCredits } from "@/services/creditService";
import { recordAdminAudit } from "@/services/adminAuditService";

const schema = z.object({
  amount: z.number().int().refine((value) => value !== 0),
  description: z.string().max(500).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    const data = schema.parse(await request.json());
    const balance = await adminAdjustCredits({
      userId: params.id,
      amount: data.amount,
      description: data.description,
    });
    await recordAdminAudit({
      adminUserId: admin.id,
      action: "user.credits.adjust",
      targetType: "user",
      targetId: params.id,
      detail: data,
    });
    const user = await prisma.user.findUnique({ where: { id: params.id } });
    return Response.json({ balance, user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.flatten() }, { status: 400 });
    }
    if (error instanceof Error && error.message === "INSUFFICIENT_CREDITS") {
      return Response.json({ error: "User does not have enough credits" }, { status: 400 });
    }
    return authError(error);
  }
}
