import { UserRole, UserStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authError, requireAdmin } from "@/lib/server-auth";
import { recordAdminAudit } from "@/services/adminAuditService";

const schema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        creditTransactions: { orderBy: { createdAt: "desc" }, take: 50 },
        generationLogs: { orderBy: { createdAt: "desc" }, take: 50 },
        orders: { orderBy: { createdAt: "desc" }, take: 50 },
      },
    });
    if (!user) return Response.json({ error: "User not found" }, { status: 404 });
    return Response.json({ user });
  } catch (error) {
    return authError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    const data = schema.parse(await request.json());
    const user = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: params.id },
        data,
      });
      await recordAdminAudit(
        {
          adminUserId: admin.id,
          action: "user.update",
          targetType: "user",
          targetId: params.id,
          detail: data,
        },
        tx
      );
      return updated;
    });
    return Response.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.flatten() }, { status: 400 });
    }
    return authError(error);
  }
}
