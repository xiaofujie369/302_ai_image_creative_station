import { prisma } from "@/lib/prisma";
import { authError, requireAdmin } from "@/lib/server-auth";

export async function GET() {
  try {
    await requireAdmin();
    const logs = await prisma.adminAuditLog.findMany({
      include: { adminUser: { select: { email: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return Response.json({ logs });
  } catch (error) {
    return authError(error);
  }
}
