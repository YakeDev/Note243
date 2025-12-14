import { prisma } from "@/lib/prisma";
import { SuggestionActions } from "./SuggestionActions";

export const dynamic = "force-dynamic";

async function getSuggestions() {
  return prisma.businessSuggestion.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { id: true, name: true } },
      submittedBy: { select: { id: true, name: true, email: true } },
      reviewedBy: { select: { id: true, name: true, email: true } },
    },
  });
}

export default async function AdminSuggestionsPage() {
  const suggestions = await getSuggestions();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Suggestions</p>
        <h1 className="text-2xl font-bold text-slate-900">Propositions d’etablissements</h1>
        <p className="text-sm text-slate-600">
          Validez ou refusez les etablissements proposes par la communaute.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {suggestions.map((sugg) => (
          <div
            key={sugg.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900">
                  {sugg.name} • {sugg.category?.name ?? "Sans categorie"}
                </p>
                <p className="text-xs text-slate-600">
                  Propose par {sugg.submittedBy?.name ?? sugg.submittedBy?.email} le{" "}
                  {new Date(sugg.createdAt).toLocaleDateString()} • Statut {sugg.status}
                </p>
                {sugg.location && <p className="text-xs text-slate-600">Localisation: {sugg.location}</p>}
                {sugg.phone && <p className="text-xs text-slate-600">Telephone: {sugg.phone}</p>}
                {sugg.website && (
                  <p className="text-xs text-slate-600">
                    Site:{" "}
                    <a href={sugg.website} className="text-primary underline" target="_blank" rel="noreferrer">
                      {sugg.website}
                    </a>
                  </p>
                )}
                {sugg.reviewedBy && (
                  <p className="text-xs text-slate-600">
                    Traite par {sugg.reviewedBy.name ?? sugg.reviewedBy.email}{" "}
                    {sugg.reviewedAt
                      ? `le ${new Date(sugg.reviewedAt).toLocaleDateString()}`
                      : ""}
                  </p>
                )}
                {sugg.rejectReason && (
                  <p className="text-xs text-rose-600">Raison du rejet: {sugg.rejectReason}</p>
                )}
              </div>
              {sugg.status === "PENDING" ? (
                <SuggestionActions id={sugg.id} />
              ) : (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {sugg.status}
                </span>
              )}
            </div>
          </div>
        ))}

        {suggestions.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
            Aucune suggestion en attente.
          </p>
        )}
      </div>
    </div>
  );
}
