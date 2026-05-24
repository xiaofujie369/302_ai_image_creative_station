"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-slate-100"
    >
      Sign out
    </button>
  );
}
