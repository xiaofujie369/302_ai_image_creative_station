"use client";

import { useState } from "react";

export default function AdminSettingsForm({
  initial,
}: {
  initial: { key: string; value: string; description?: string | null }[];
}) {
  const [settings, setSettings] = useState<Record<string, string>>(
    Object.fromEntries(initial.map((item) => [item.key, item.value]))
  );
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaved(false);
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
    });
    setSaved(true);
  }

  return (
    <div className="space-y-3">
      {initial.map((item) => (
        <label key={item.key} className="block rounded-lg border bg-white p-4 shadow-sm">
          <span className="text-sm font-medium">{item.key}</span>
          {item.description && (
            <span className="ml-2 text-xs text-slate-500">{item.description}</span>
          )}
          <input
            value={settings[item.key] ?? ""}
            onChange={(event) =>
              setSettings((current) => ({ ...current, [item.key]: event.target.value }))
            }
            className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
          />
        </label>
      ))}
      <button
        onClick={save}
        className="rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
      >
        Save settings
      </button>
      {saved && <span className="ml-3 text-sm text-green-700">Saved</span>}
    </div>
  );
}
