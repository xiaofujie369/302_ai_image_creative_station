"use client";

import { useState } from "react";

export default function CheckoutButton({ planId }: { planId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkout() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error || "Unable to start checkout");
      setLoading(false);
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div>
      <button
        onClick={checkout}
        disabled={loading}
        className="w-full rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Opening checkout..." : "Buy credits"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
