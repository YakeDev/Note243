import { prisma } from "@/lib/prisma";
import { ClaimActions } from "./ClaimActions";

export const dynamic = "force-dynamic";

async function getClaims() {
  return prisma.claim.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      business: { select: { id: true, name: true } },
      user: { select: { id: true, name: true, email: true } },
      reviewedBy: { select: { id: true, name: true, email: true } },
    },
  });
}

export default async function AdminClaimsPage() {
  const claims = await getClaims();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Revendications</p>
        <h1 className="text-2xl font-bold text-slate-900">Revendications de fiches</h1>
        <p className="text-sm text-slate-600">
          Validez ou refusez les demandes de prise de possession des etablissements.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {claims.map((claim) => (
          <div
            key={claim.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900">
                  {claim.user?.name ?? "Utilisateur"} ({claim.user?.email ?? "?"})
                </p>
                <p className="text-xs text-slate-600">
                  Revendique : {claim.business?.name ?? "?"} • Statut : {claim.status}
                </p>
                {claim.proofUrl && (
                  <p className="text-xs text-slate-600">
                    Preuve:{" "}
                    <a
                      href={claim.proofUrl}
                      className="text-primary underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {claim.proofUrl}
                    </a>
                  </p>
                )}
                {claim.notes && <p className="text-xs text-slate-600">Notes: {claim.notes}</p>}
                {claim.reviewedBy && (
                  <p className="text-xs text-slate-600">
                    Traite par {claim.reviewedBy.name ?? claim.reviewedBy.email}{" "}
                    {claim.reviewedAt
                      ? `le ${new Date(claim.reviewedAt).toLocaleDateString()}`
                      : ""}
                  </p>
                )}
                {claim.message && <p className="mt-2 text-sm text-slate-800">{claim.message}</p>}
              </div>
              <ClaimActions id={claim.id} status={claim.status} />
            </div>
          </div>
        ))}
        {claims.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
            Aucune revendication en attente.
          </p>
        )}
      </div>
    </div>
  );
}
