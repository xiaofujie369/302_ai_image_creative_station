import { handleStripeWebhook, verifyStripeWebhook } from "@/services/orderService";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  try {
    const event = verifyStripeWebhook(rawBody, signature);
    await handleStripeWebhook(event);
    return Response.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid webhook";
    return Response.json({ error: message }, { status: 400 });
  }
}
