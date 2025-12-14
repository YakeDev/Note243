"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

type Status = "PUBLISHED" | "HIDDEN" | "REMOVED";

export function ReviewActions({ id, status }: { id: string; status: Status }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const updateStatus = (next: Status) => {
    startTransition(async () => {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: next }),
      });
      if (!res.ok) {
        alert("Impossible de mettre à jour l'avis.");
        return;
      }
      router.refresh();
    });
  };

  const onDelete = () => {
    const ok = window.confirm("Supprimer définitivement cet avis ?");
    if (!ok) return;
    startTransition(async () => {
      const res = await fetch("/api/admin/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        alert("Suppression impossible.");
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => updateStatus("PUBLISHED")}
        disabled={pending || status === "PUBLISHED"}
        className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-800 hover:border-primary hover:text-primary disabled:opacity-60"
      >
        Publier
      </button>
      <button
        type="button"
        onClick={() => updateStatus("HIDDEN")}
        disabled={pending || status === "HIDDEN"}
        className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700 hover:border-amber-300 disabled:opacity-60"
      >
        Masquer
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={pending}
        className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700 hover:border-rose-300 disabled:opacity-60"
      >
        Supprimer
      </button>
    </div>
  );
}
