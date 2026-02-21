import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BusinessDeleteButton } from "./BusinessDeleteButton";

export const dynamic = "force-dynamic";

async function getBusinesses() {
  return prisma.business.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { id: true, name: true } },
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { reviews: true } },
    },
  });
}

export default async function AdminBusinessesPage() {
  const businesses = await getBusinesses();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Établissements</p>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des établissements</h1>
          <p className="text-sm text-slate-600">
            Créez, modifiez ou supprimez les fiches et suivez les avis associés.
          </p>
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
