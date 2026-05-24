"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function emailLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    await signIn("email", {
      email,
      callbackUrl: "/account",
    });
    setLoading(false);
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-lg border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="mt-2 text-sm text-slate-600">
        Use Google or your email to access credits, orders, and generation history.
      </p>
      <button
        onClick={() => signIn("google", { callbackUrl: "/account" })}
        className="mt-6 w-full rounded-md border px-4 py-3 text-sm font-semibold hover:bg-slate-50"
      >
        Continue with Google
      </button>
      <form onSubmit={emailLogin} className="mt-4 space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-md border px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-900"
        />
        <button
          disabled={loading}
          className="w-full rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Continue with email"}
        </button>
      </form>
    </div>
  );
}
