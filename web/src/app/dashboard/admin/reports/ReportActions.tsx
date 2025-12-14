"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function ReportActions({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const update = (status: "PENDING" | "RESOLVED" | "DISMISSED", hideReview?: boolean) => {
    startTransition(async () => {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reportId, status, hideReview }),
      });
      if (!res.ok) {
        alert("Impossible de mettre à jour le signalement.");
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => update("RESOLVED", true)}
        disabled={pending}
        className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700 hover:border-amber-300 disabled:opacity-60"
      >
        Masquer l’avis
      </button>
      <button
        type="button"
        onClick={() => update("DISMISSED", false)}
        disabled={pending}
        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 hover:border-emerald-300 disabled:opacity-60"
      >
        Rejeter
      </button>
      <button
        type="button"
        onClick={() => update("PENDING")}
        disabled={pending}
        className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-800 hover:border-primary hover:text-primary disabled:opacity-60"
      >
        Remettre en attente
      </button>
    </div>
  );
}
