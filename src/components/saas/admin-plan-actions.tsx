"use client";

import { useState } from "react";

export function AdminPlanForm() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState(2.99);
  const [credits, setCredits] = useState(50);
  const [sortOrder, setSortOrder] = useState(10);

  async function create() {
    await fetch("/api/admin/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price, credits, sortOrder, currency: "USD", isActive: true }),
    });
    window.location.reload();
  }

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <h2 className="mb-3 font-semibold">New plan</h2>
      <div className="grid gap-2 md:grid-cols-5">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="rounded-md border px-3 py-2 text-sm" />
        <input type="number" step="0.01" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="rounded-md border px-3 py-2 text-sm" />
        <input type="number" value={credits} onChange={(e) => setCredits(Number(e.target.value))} className="rounded-md border px-3 py-2 text-sm" />
        <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className="rounded-md border px-3 py-2 text-sm" />
        <button onClick={create} className="rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white">Create</button>
      </div>
    </div>
  );
}

export function AdminPlanToggle({ id, isActive }: { id: string; isActive: boolean }) {
  async function toggle() {
    await fetch(`/api/admin/plans/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    window.location.reload();
  }

  return (
    <button onClick={toggle} className="rounded-md border px-2 py-1 text-xs">
      {isActive ? "Disable" : "Enable"}
    </button>
  );
}

export function AdminPlanEdit({
  id,
  price: initialPrice,
  credits: initialCredits,
  sortOrder: initialSortOrder,
}: {
  id: string;
  price: number;
  credits: number;
  sortOrder: number;
}) {
  const [price, setPrice] = useState(initialPrice);
  const [credits, setCredits] = useState(initialCredits);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);

  async function save() {
    await fetch(`/api/admin/plans/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price, credits, sortOrder }),
    });
    window.location.reload();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <input type="number" step="0.01" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-24 rounded-md border px-2 py-1 text-xs" />
      <input type="number" value={credits} onChange={(e) => setCredits(Number(e.target.value))} className="w-20 rounded-md border px-2 py-1 text-xs" />
      <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className="w-16 rounded-md border px-2 py-1 text-xs" />
      <button onClick={save} className="rounded-md border px-2 py-1 text-xs">Save</button>
    </div>
  );
}
