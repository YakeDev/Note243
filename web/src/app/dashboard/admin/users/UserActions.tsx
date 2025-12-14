"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

type Status = "ACTIVE" | "SUSPENDED";

export function UserActions({ id, status }: { id: string; status: Status }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const update = (next: Status) => {
    startTransition(async () => {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: next }),
      });
      if (!res.ok) {
        alert("Impossible de mettre à jour l'utilisateur.");
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => update("ACTIVE")}
        disabled={pending || status === "ACTIVE"}
        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 hover:border-emerald-300 disabled:opacity-60"
      >
        Activer
      </button>
      <button
        type="button"
        onClick={() => update("SUSPENDED")}
        disabled={pending || status === "SUSPENDED"}
        className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700 hover:border-rose-300 disabled:opacity-60"
      >
        Suspendre
      </button>
    </div>
  );
}
