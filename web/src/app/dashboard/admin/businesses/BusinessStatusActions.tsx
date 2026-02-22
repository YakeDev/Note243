"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

type Status =
  | "PENDING_REVIEW"
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "REJECTED"
  | "CERTIFIED";

const labels: Record<Status, string> = {
  PENDING_REVIEW: "En attente",
  ACTIVE: "Actif",
  INACTIVE: "Inactif",
  SUSPENDED: "Suspendu",
  REJECTED: "Rejete",
  CERTIFIED: "Certifie",
};

export function BusinessStatusActions({ id, status }: { id: string; status: Status }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const updateStatus = (next: Status, rejectReason?: string) => {
    startTransition(async () => {
      const res = await fetch("/api/admin/businesses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: next, rejectReason }),
      });
      if (!res.ok) {
        alert("Impossible de mettre a jour le statut.");
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-slate-500">{labels[status]}</span>
      {status === "PENDING_REVIEW" ? (
        <>
          <button
            type="button"
            onClick={() => updateStatus("ACTIVE")}
            disabled={pending}
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:border-emerald-300 disabled:opacity-60"
          >
            Approuver
          </button>
          <button
            type="button"
            onClick={() => {
              const reason = window.prompt("Motif du rejet (obligatoire)", "");
              if (reason === null) return;
              if (reason.trim().length === 0) {
                alert("Motif requis.");
                return;
              }
              updateStatus("REJECTED", reason);
            }}
            disabled={pending}
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 hover:border-rose-300 disabled:opacity-60"
          >
            Rejeter
          </button>
        </>
      ) : null}
    </div>
  );
}
