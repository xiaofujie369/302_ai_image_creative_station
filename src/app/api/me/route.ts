import { authError, requireUser } from "@/lib/server-auth";

export async function GET() {
  try {
    const user = await requireUser();
    return Response.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.image,
      role: user.role,
      credits: user.credits,
      status: user.status,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    });
  } catch (error) {
    return authError(error);
  }
}
