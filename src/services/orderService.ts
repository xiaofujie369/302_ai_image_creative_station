import Stripe from "stripe";
import { CreditTransactionType, OrderProvider, OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { addCredits } from "@/services/creditService";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-11-20.acacia" as any,
  });
}

export async function createStripeCheckout(input: {
  userId: string;
  planId: string;
}) {
  const plan = await prisma.plan.findFirst({
    where: { id: input.planId, isActive: true },
  });
  if (!plan) throw new Error("PLAN_NOT_FOUND");

  const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const amount = Number(plan.price);
  const order = await prisma.order.create({
    data: {
      userId: input.userId,
      provider: OrderProvider.STRIPE,
      amount: plan.price,
      currency: plan.currency,
      credits: plan.credits,
      status: OrderStatus.PENDING,
    },
  });

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${appUrl}/account/orders?checkout=success`,
    cancel_url: `${appUrl}/pricing?checkout=cancelled`,
    customer_email:
      (await prisma.user.findUnique({ where: { id: input.userId } }))?.email ||
      undefined,
    metadata: {
      orderId: order.id,
      userId: input.userId,
      planId: plan.id,
      credits: String(plan.credits),
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: plan.currency.toLowerCase(),
          unit_amount: Math.round(amount * 100),
          product_data: {
            name: `${plan.name} - ${plan.credits} credits`,
          },
        },
      },
    ],
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { providerOrderId: session.id },
  });

  return session.url;
}

export function verifyStripeWebhook(rawBody: string, signature: string | null) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }
  if (!signature) throw new Error("Missing Stripe signature");

  return getStripe().webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}

export async function handleStripeWebhook(event: Stripe.Event) {
  if (event.type !== "checkout.session.completed") {
    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      await prisma.order.updateMany({
        where: { providerOrderId: session.id, status: OrderStatus.PENDING },
        data: { status: OrderStatus.FAILED },
      });
    }
    return;
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = session.metadata?.orderId;

  if (session.payment_status && session.payment_status !== "paid") {
    return;
  }

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: {
        OR: [
          { id: orderId || "" },
          { providerOrderId: session.id },
        ],
      },
    });
    if (!order) return;

    const paidAt = session.created
      ? new Date(session.created * 1000)
      : new Date();

    const result = await tx.order.updateMany({
      where: { id: order.id, status: OrderStatus.PENDING },
      data: {
        providerOrderId: session.id,
        status: OrderStatus.PAID,
        paidAt,
      },
    });

    if (result.count !== 1) return;

    await addCredits(tx, {
      userId: order.userId,
      amount: order.credits,
      type: CreditTransactionType.PURCHASE,
      relatedOrderId: order.id,
      description: `Stripe purchase ${session.id}`,
    });
  });
}
