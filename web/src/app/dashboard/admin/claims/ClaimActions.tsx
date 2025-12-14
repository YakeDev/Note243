"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function ClaimActions({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const update = (status: "APPROVED" | "REJECTED" | "PENDING") => {
    startTransition(async () => {
      let url = "";
      if (status === "APPROVED") url = `/api/claims/${id}/approve`;
      else if (status === "REJECTED") url = `/api/claims/${id}/reject`;
      else url = "/api/admin/claims";

      const res =
        status === "PENDING"
          ? await fetch(url)
          : await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" } });

      if (!res.ok) {
        alert("Impossible de mettre a jour la revendication.");
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => update("APPROVED")}
        disabled={pending}
        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 hover:border-emerald-300 disabled:opacity-60"
      >
        Approuver
      </button>
      <button
        type="button"
        onClick={() => update("REJECTED")}
        disabled={pending}
        className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700 hover:border-rose-300 disabled:opacity-60"
      >
        Refuser
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
