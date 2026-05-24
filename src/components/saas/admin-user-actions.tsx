"use client";

import { useState } from "react";

export function AdminUserActions({
  userId,
  role,
  status,
}: {
  userId: string;
  role: string;
  status: string;
}) {
  const [busy, setBusy] = useState(false);

  async function patch(data: Record<string, unknown>) {
    setBusy(true);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    window.location.reload();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        disabled={busy}
        onClick={() => patch({ role: role === "ADMIN" ? "USER" : "ADMIN" })}
        className="rounded-md border px-2 py-1 text-xs"
      >
        {role === "ADMIN" ? "Make user" : "Make admin"}
      </button>
      <button
        disabled={busy}
        onClick={() => patch({ status: status === "BANNED" ? "ACTIVE" : "BANNED" })}
        className="rounded-md border px-2 py-1 text-xs"
      >
        {status === "BANNED" ? "Activate" : "Ban"}
      </button>
    </div>
  );
}

export function AdminCreditForm({ userId }: { userId: string }) {
  const [amount, setAmount] = useState(10);
  const [description, setDescription] = useState("Manual admin adjustment");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    await fetch(`/api/admin/users/${userId}/credits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, description }),
    });
    window.location.reload();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <input
        type="number"
        value={amount}
        onChange={(event) => setAmount(Number(event.target.value))}
        className="w-24 rounded-md border px-2 py-1 text-sm"
      />
      <input
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        className="w-56 rounded-md border px-2 py-1 text-sm"
      />
      <button
        disabled={busy}
        onClick={submit}
        className="rounded-md bg-slate-950 px-3 py-1 text-sm font-medium text-white"
      >
        Adjust
      </button>
    </div>
  );
}
