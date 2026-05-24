import { prisma } from "@/lib/prisma";
import { authError, requireUser } from "@/lib/server-auth";

export async function GET() {
  try {
    const user = await requireUser();
    const transactions = await prisma.creditTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return Response.json({ balance: user.credits, transactions });
  } catch (error) {
    return authError(error);
  }
}
