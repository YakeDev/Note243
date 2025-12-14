"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function BusinessDeleteButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onDelete = () => {
    const ok = window.confirm(`Supprimer définitivement "${name}" ?`);
    if (!ok) return;

    startTransition(async () => {
      const res = await fetch(`/api/business/${id}`, { method: "DELETE" });
      if (!res.ok) {
        alert("Suppression impossible.");
        return;
      }
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={pending}
      className="text-sm font-semibold text-rose-600 hover:text-rose-700 disabled:opacity-60"
    >
      {pending ? "Suppression..." : "Supprimer"}
    </button>
  );
}
