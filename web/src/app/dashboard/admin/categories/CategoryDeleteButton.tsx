"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function CategoryDeleteButton({ slug, hasBusinesses }: { slug: string; hasBusinesses: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const disabled = pending || hasBusinesses;

  const onDelete = () => {
    if (hasBusinesses) {
      alert("Impossible de supprimer une catégorie qui contient des établissements.");
      return;
    }
    const confirm = window.confirm("Confirmer la suppression de cette catégorie ?");
    if (!confirm) return;

    startTransition(async () => {
      const res = await fetch(`/api/categories/${encodeURIComponent(slug)}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        alert(json.message || "Suppression impossible.");
        return;
      }
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={disabled}
      className="text-sm font-semibold text-rose-600 hover:text-rose-700 disabled:cursor-not-allowed disabled:text-slate-400"
    >
      {pending ? "Suppression..." : "Supprimer"}
    </button>
  );
}
