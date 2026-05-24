import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type Tx = Prisma.TransactionClient;

export async function recordAdminAudit(
  input: {
    adminUserId: string;
    action: string;
    targetType: string;
    targetId?: string;
    detail?: Prisma.InputJsonValue;
  },
  tx: Tx | typeof prisma = prisma
) {
  await tx.adminAuditLog.create({
    data: {
      adminUserId: input.adminUserId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      detail: input.detail,
    },
  });
}
