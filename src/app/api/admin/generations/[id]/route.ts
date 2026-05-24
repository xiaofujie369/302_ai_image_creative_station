import { prisma } from "@/lib/prisma";
import { authError, requireAdmin } from "@/lib/server-auth";
import { recordAdminAudit } from "@/services/adminAuditService";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    await prisma.$transaction(async (tx) => {
      await tx.generationLog.delete({ where: { id: params.id } });
      await recordAdminAudit(
        {
          adminUserId: admin.id,
          action: "generation.delete",
          targetType: "generation",
          targetId: params.id,
        },
        tx
      );
    });
    return Response.json({ ok: true });
  } catch (error) {
    return authError(error);
  }
}
