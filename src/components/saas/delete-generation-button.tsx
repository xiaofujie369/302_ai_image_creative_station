"use client";

export default function DeleteGenerationButton({ id }: { id: string }) {
  async function remove() {
    if (!confirm("Delete this generation record?")) return;
    await fetch(`/api/admin/generations/${id}`, { method: "DELETE" });
    window.location.reload();
  }

  return (
    <button onClick={remove} className="rounded-md border px-2 py-1 text-xs text-red-600">
      Delete
    </button>
  );
}
