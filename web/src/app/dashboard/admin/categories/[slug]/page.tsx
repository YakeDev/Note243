import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "../CategoryForm";

export default async function EditCategoryPage({ params }: { params: { slug: string } }) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      icon: true,
      parentId: true,
      _count: { select: { businesses: true } },
    },
  });

  if (!category) {
    notFound();
  }

  const parentOptions = await prisma.category.findMany({
    where: { parentId: null, NOT: { id: category.id } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Éditer la catégorie</h1>
      <p className="mt-1 text-sm text-slate-600">
        Slug et nom contrôlent l&apos;affichage public. Les suppressions sont bloquées si des
        établissements sont liés.
      </p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between text-sm text-slate-600">
          <span>Établissements liés : {category._count?.businesses ?? 0}</span>
          <span>Slug actuel : {category.slug}</span>
        </div>
        <CategoryForm
          mode="edit"
          initialSlug={params.slug}
          initialData={category}
          parentOptions={parentOptions}
        />
      </div>
    </div>
  );
}
