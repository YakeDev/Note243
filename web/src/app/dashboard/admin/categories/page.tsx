import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CategoryDeleteButton } from "./CategoryDeleteButton";

async function getCategories() {
  return prisma.category.findMany({
    include: {
      parent: { select: { id: true, name: true } },
      _count: { select: { businesses: true, children: true } },
    },
    orderBy: [{ parentId: "asc" }, { name: "asc" }],
  });
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Catégories</p>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des catégories</h1>
          <p className="text-sm text-slate-600">
            Créez, éditez et supprimez les catégories visibles sur Note243.
          </p>
        </div>
        <Link
          href="/dashboard/admin/categories/new"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover"
        >
          + Nouvelle catégorie
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Parent</th>
              <th className="px-4 py-3">Établissements</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-900">{cat.name}</td>
                <td className="px-4 py-3 text-slate-600">{cat.slug}</td>
                <td className="px-4 py-3 text-slate-600">{cat.parent?.name ?? "-"}</td>
                <td className="px-4 py-3 text-slate-600">{cat._count?.businesses ?? 0}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/dashboard/admin/categories/${cat.slug}`}
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      Éditer
                    </Link>
                    <CategoryDeleteButton
                      slug={cat.slug}
                      hasBusinesses={(cat._count?.businesses ?? 0) > 0}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-slate-600">
            Aucune catégorie définie pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}
