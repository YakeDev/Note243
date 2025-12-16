"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ReportButton } from "./ReportButton";
import { StarIcon } from "./icons";

type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  userName?: string | null;
  businessId?: string;
};

type Filter = "all" | "positive" | "negative" | "recent";

function formatRelativeDate(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return "Aujourd'hui";
  if (diffDays === 1) return "Il y a 1 jour";
  if (diffDays < 30) return `Il y a ${diffDays} jours`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return "Il y a 1 mois";
  if (diffMonths < 12) return `Il y a ${diffMonths} mois`;
  const diffYears = Math.floor(diffMonths / 12);
  return diffYears === 1 ? "Il y a 1 an" : `Il y a ${diffYears} ans`;
}

function Stars({ value }: { value: number }) {
  const filled = Math.round(Math.max(0, Math.min(5, value)));
  return (
    <span className="flex items-center gap-0.5 text-amber-500">
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon
          key={n}
          className={`h-4 w-4 ${n <= filled ? "fill-amber-400" : "fill-transparent stroke-amber-400"}`}
        />
      ))}
    </span>
  );
}

function filterReviews(reviews: Review[], filter: Filter) {
  if (filter === "positive") return reviews.filter((rev) => rev.rating >= 4);
  if (filter === "negative") return reviews.filter((rev) => rev.rating <= 2);
  if (filter === "recent") {
    const thirtyDaysAgo = Date.now() - 1000 * 60 * 60 * 24 * 30;
    return reviews.filter((rev) => new Date(rev.createdAt).getTime() >= thirtyDaysAgo);
  }
  return reviews;
}

export function BusinessReviews({
  reviews,
  summary,
}: {
  reviews: Review[];
  summary?: { total: number; average: number };
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    const base = filterReviews(reviews, filter);
    return [...base].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [filter, reviews]);

  const filterButton = (value: Filter, label: string) => {
    const active = filter === value;
    return (
      <button
        key={value}
        onClick={() => setFilter(value)}
        className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
          active
            ? "border-primary bg-primary text-white shadow"
            : "border-slate-200 text-slate-700 hover:border-primary hover:text-primary"
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Avis des utilisateurs</h2>
          <p className="text-sm text-slate-600">
            {summary
              ? `${summary.total} avis publiés · moyenne ${summary.average.toFixed(1)}/5`
              : "Filtrez par tonalité ou par fraîcheur pour trouver les retours qui comptent."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {filterButton("all", "Tous")}
          {filterButton("positive", "Positifs")}
          {filterButton("negative", "Négatifs")}
          {filterButton("recent", "Récents (30j)")}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-600">
          Aucun avis pour ce filtre. Essayez un autre critère.
        </p>
      ) : (
        <div className="space-y-4">
          {filtered.map((review) => (
            <article key={review.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {review.userName ?? "Utilisateur"}
                  </p>
                  <p className="text-xs text-slate-500">{formatRelativeDate(review.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Stars value={review.rating} />
                  <span className="text-xs font-semibold text-slate-700">{review.rating.toFixed(1)}</span>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700">{review.comment}</p>
              <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-slate-500">
                <ReportButton reviewId={review.id} />
                <Link
                  href={`/review/new?businessId=${review.businessId ?? ""}`}
                  className="hover:text-primary"
                >
                  Répondre / ajouter un retour
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

