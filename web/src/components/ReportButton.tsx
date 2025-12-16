"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { XMarkIcon } from "@/components/icons";

interface Props {
  reviewId: string;
}

type ReportReason = "insulte" | "faux-avis" | "spam" | "conflit" | "autre";

const reasons: { value: ReportReason; label: string }[] = [
  { value: "insulte", label: "Insulte ou contenu inapproprié" },
  { value: "faux-avis", label: "Faux avis" },
  { value: "spam", label: "Spam ou publicité" },
  { value: "conflit", label: "Conflit d'intérêt" },
  { value: "autre", label: "Autre" },
];

export function ReportButton({ reviewId }: Props) {
  const { status } = useSession();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("insulte");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (status !== "authenticated") {
      signIn();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId,
          reason,
          details: details.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Impossible d'envoyer le signalement.");
      }
      setDone(true);
      setOpen(false);
    } catch (err: any) {
      setError(err.message ?? "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return <span className="text-xs font-semibold text-emerald-600">Signalement envoyé</span>;
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={loading}
        className="text-xs font-semibold text-slate-500 hover:text-primary disabled:opacity-50"
      >
        Signaler
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Signaler cet avis</h3>
                <p className="text-sm text-slate-600">
                  Choisissez une raison et ajoutez un détail pour aider la modération.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Fermer"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Raison</p>
                <div className="space-y-2">
                  {reasons.map((item) => (
                    <label key={item.value} className="flex cursor-pointer items-start gap-2 text-sm text-slate-700">
                      <input
                        type="radio"
                        name={`reason-${reviewId}`}
                        value={item.value}
                        checked={reason === item.value}
                        onChange={() => setReason(item.value)}
                        className="mt-0.5"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Détails (optionnel)
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="mt-1 h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Expliquez brièvement le problème"
                />
              </div>

              {error ? <p className="text-sm text-rose-600">{error}</p> : null}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  onClick={() => setOpen(false)}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={loading}
                  className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
                >
                  {loading ? "Envoi..." : "Envoyer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
