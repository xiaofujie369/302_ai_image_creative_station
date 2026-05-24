import { z } from "zod";
import { authError, requireUser } from "@/lib/server-auth";
import { createStripeCheckout } from "@/services/orderService";

const schema = z.object({
  planId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const { planId } = schema.parse(await request.json());
    const url = await createStripeCheckout({ userId: user.id, planId });
    return Response.json({ url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.flatten() }, { status: 400 });
    }
    if (error instanceof Error && error.message === "PLAN_NOT_FOUND") {
      return Response.json({ error: "Plan not found" }, { status: 404 });
    }
    return authError(error);
  }
}
