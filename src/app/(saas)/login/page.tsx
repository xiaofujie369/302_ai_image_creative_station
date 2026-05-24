import { redirect } from "next/navigation";
import LoginForm from "@/components/saas/login-form";
import { getCurrentUser } from "@/lib/server-auth";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/account");

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center px-4 py-12">
      <LoginForm />
    </main>
  );
}
