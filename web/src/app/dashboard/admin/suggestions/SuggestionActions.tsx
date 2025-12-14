"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function SuggestionActions({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rejectReason, setRejectReason] = useState("");

  const approve = () => {
    startTransition(async () => {
      const res = await fetch(`/api/suggestions/${id}/approve`, { method: "POST" });
      if (!res.ok) alert("Echec de l'approbation");
      router.refresh();
    });
  };

  const reject = () => {
    startTransition(async () => {
      const res = await fetch(`/api/suggestions/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason || undefined }),
      });
      if (!res.ok) alert("Echec du rejet");
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={approve}
        disabled={pending}
        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 hover:border-emerald-300 disabled:opacity-60"
      >
        Approuver
      </button>
      <div className="flex flex-1 items-center gap-2">
        <input
          type="text"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Raison (optionnel)"
          className="w-full rounded-lg border border-slate-200 px-3 py-1 text-sm focus:border-primary focus:outline-none"
        />
        <button
          type="button"
          onClick={reject}
          disabled={pending}
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700 hover:border-rose-300 disabled:opacity-60"
        >
          Rejeter
        </button>
      </div>
    </div>
  );
}
