import Link from "next/link";
import { BusinessStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { BusinessDeleteButton } from "./BusinessDeleteButton";
import { BusinessStatusActions } from "./BusinessStatusActions";

export const dynamic = "force-dynamic";

async function getBusinesses(status?: BusinessStatus) {
  return prisma.business.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { id: true, name: true } },
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { reviews: true } },
    },
  });
}

export default async function AdminBusinessesPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const statusParam =
    typeof searchParams?.status === "string" ? searchParams.status : undefined;
  const status =
    statusParam && Object.values(BusinessStatus).includes(statusParam as BusinessStatus)
      ? (statusParam as BusinessStatus)
      : undefined;
  const pendingActive = status === BusinessStatus.PENDING_REVIEW;

  const businesses = await getBusinesses(status);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Établissements</p>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des établissements</h1>
          <p className="text-sm text-slate-600">
            Créez, modifiez ou supprimez les fiches et suivez les avis associés.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
            <Link
              href="/dashboard/admin/businesses"
              className={`rounded-full border px-3 py-1 ${
                !pendingActive
                  ? "border-primary bg-primary text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary"
              }`}
            >
              Tous
            </Link>
            <Link
              href="/dashboard/admin/businesses?status=PENDING_REVIEW"
              className={`rounded-full border px-3 py-1 ${
                pendingActive
                  ? "border-amber-300 bg-amber-100 text-amber-900"
                  : "border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:text-amber-700"
              }`}
            >
              En attente
            </Link>
          </div>
        </div>
        <Link
          href="/explorer"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover"
        >
          Voir le catalogue public
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Propriétaire</th>
              <th className="px-4 py-3">Avis</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {businesses.map((biz) => (
              <tr key={biz.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-900">{biz.name}</td>
                <td className="px-4 py-3 text-slate-600">{biz.category?.name ?? "-"}</td>
                <td className="px-4 py-3 text-slate-600">
                  {biz.owner ? `${biz.owner.name ?? ""} (${biz.owner.email})` : "-"}
                </td>
                <td className="px-4 py-3 text-slate-600">{biz._count?.reviews ?? 0}</td>
                <td className="px-4 py-3">
                  <BusinessStatusActions id={biz.id} status={biz.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/business/${biz.id}`}
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      Ouvrir
                    </Link>
                    <Link
                      href={`/dashboard/admin/businesses/${biz.id}`}
                      className="text-sm font-semibold text-slate-600 hover:underline"
                    >
                      Images
                    </Link>
                    <BusinessDeleteButton id={biz.id} name={biz.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {businesses.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-slate-600">
            Aucun établissement enregistré.
          </p>
        )}
      </div>
    </div>
  );
}
