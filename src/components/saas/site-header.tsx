import Link from "next/link";
import { getCurrentUser } from "@/lib/server-auth";

export default async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 font-semibold">
          <img
            src="/images/global/logo-light.png"
            alt="AI Image Creative Station"
            className="h-8 w-auto"
          />
          <span className="hidden sm:inline">AI Image Creative Station</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/generate">
            Generate
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/pricing">
            Pricing
          </Link>
          {user ? (
            <>
              <Link
                className="rounded-md bg-slate-900 px-3 py-2 font-medium text-white"
                href="/account"
              >
                {user.credits} credits
              </Link>
              {user.role === "ADMIN" && (
                <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/admin">
                  Admin
                </Link>
              )}
            </>
          ) : (
            <Link
              className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white"
              href="/login"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
