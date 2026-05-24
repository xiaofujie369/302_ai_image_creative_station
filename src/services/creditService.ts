import {
  CreditTransactionType,
  GenerationMode,
  OrderProvider,
  OrderStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { asNumber, getSettingsMap } from "@/lib/settings";

type Tx = Prisma.TransactionClient;

export async function estimateGenerationCost(input: {
  mode: GenerationMode;
  model: string;
  quality?: string | null;
  count?: number;
}) {
  const settings = await getSettingsMap();
  const count = Math.max(1, Math.min(input.count || 1, 10));
  const base =
    input.mode === GenerationMode.IMAGE_EDIT
      ? asNumber(settings.get("credits.image_edit"), 3)
      : input.mode === GenerationMode.VARIATION
        ? asNumber(settings.get("credits.variation"), 3)
        : asNumber(settings.get("credits.text_to_image"), 1);
  const hdExtra =
    input.quality === "hd" || input.quality === "high"
      ? asNumber(settings.get("credits.hd"), 3)
      : 0;
  const multiplier =
    input.model === "gpt-image-2"
      ? Math.max(1, asNumber(settings.get("credits.gpt_image_2_multiplier"), 1))
      : 1;

  return Math.ceil((base + hdExtra) * count * multiplier);
}

export async function assertEnoughCredits(userId: string, cost: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });
  if (!user || user.credits < cost) {
    throw new Error("INSUFFICIENT_CREDITS");
  }
}

export async function addCredits(
  tx: Tx,
  input: {
    userId: string;
    amount: number;
    type: CreditTransactionType;
    description?: string;
    relatedOrderId?: string;
  }
) {
  const user = await tx.user.update({
    where: { id: input.userId },
    data: { credits: { increment: input.amount } },
    select: { credits: true },
  });

  await tx.creditTransaction.create({
    data: {
      userId: input.userId,
      type: input.type,
      amount: input.amount,
      balanceAfter: user.credits,
      description: input.description,
      relatedOrderId: input.relatedOrderId,
    },
  });

  return user.credits;
}

export async function debitCredits(
  tx: Tx,
  input: {
    userId: string;
    amount: number;
    type?: CreditTransactionType;
    description?: string;
    relatedOrderId?: string;
  }
) {
  const result = await tx.user.updateMany({
    where: { id: input.userId, credits: { gte: input.amount } },
    data: { credits: { decrement: input.amount } },
  });

  if (result.count !== 1) {
    throw new Error("INSUFFICIENT_CREDITS");
  }

  const updated = await tx.user.findUniqueOrThrow({
    where: { id: input.userId },
    select: { credits: true },
  });

  await tx.creditTransaction.create({
    data: {
      userId: input.userId,
      type: input.type || CreditTransactionType.GENERATION,
      amount: -input.amount,
      balanceAfter: updated.credits,
      description: input.description,
      relatedOrderId: input.relatedOrderId,
    },
  });

  return updated.credits;
}

export async function adminAdjustCredits(input: {
  userId: string;
  amount: number;
  description?: string;
}) {
  return prisma.$transaction(async (tx) => {
    if (input.amount >= 0) {
      const order = await tx.order.create({
        data: {
          userId: input.userId,
          provider: OrderProvider.MANUAL,
          amount: 0,
          currency: "USD",
          credits: input.amount,
          status: OrderStatus.PAID,
          paidAt: new Date(),
        },
      });
      return addCredits(tx, {
        userId: input.userId,
        amount: input.amount,
        type: CreditTransactionType.ADMIN_ADJUSTMENT,
        description: input.description || "Admin credit adjustment",
        relatedOrderId: order.id,
      });
    }

    return debitCredits(tx, {
      userId: input.userId,
      amount: Math.abs(input.amount),
      type: CreditTransactionType.ADMIN_ADJUSTMENT,
      description: input.description || "Admin credit adjustment",
    });
  });
}
