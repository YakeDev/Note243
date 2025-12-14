import { prisma } from "@/lib/prisma";
import { ReportActions } from "./ReportActions";

export const dynamic = "force-dynamic";

async function getReports() {
  return prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reporter: { select: { id: true, name: true, email: true } },
      review: {
        select: {
          id: true,
          comment: true,
          rating: true,
          status: true,
          business: { select: { id: true, name: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });
}

export default async function AdminReportsPage() {
  const reports = await getReports();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Signalements</p>
        <h1 className="text-2xl font-bold text-slate-900">Signalements à traiter</h1>
        <p className="text-sm text-slate-600">
          Analysez les avis signalés et décidez : masquer, supprimer ou rejeter le signalement.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {reports.map((report) => (
          <div
            key={report.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">Raison : {report.reason}</p>
                <span className="text-xs font-semibold uppercase text-slate-500">
                  Statut : {report.status}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Signalé par : {report.reporter?.name ?? "?"} ({report.reporter?.email ?? "?"})
              </p>
              <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-800">
                <p className="text-xs font-semibold text-slate-600">
                  Avis concerné – {report.review?.business?.name ?? "?"} · Note {report.review?.rating}
                </p>
                <p className="mt-1">{report.review?.comment ?? "Avis supprimé"}</p>
                <p className="mt-1 text-xs text-slate-500">État de l’avis : {report.review?.status}</p>
              </div>
              <ReportActions reportId={report.id} />
            </div>
          </div>
        ))}
        {reports.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
            Aucun signalement en cours.
          </p>
        )}
      </div>
    </div>
  );
}
