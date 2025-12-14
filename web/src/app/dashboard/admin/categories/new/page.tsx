import { prisma } from "@/lib/prisma";
import { CategoryForm } from "../CategoryForm";

export default async function NewCategoryPage() {
  const parentOptions = await prisma.category.findMany({
    where: { parentId: null },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Nouvelle catégorie</h1>
      <p className="mt-1 text-sm text-slate-600">
        Définissez un nom, un slug et une description. Les comptes ADMIN peuvent ajouter des
        catégories, les propriétaires et utilisateurs ne voient que la liste publique.
      </p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <CategoryForm mode="create" parentOptions={parentOptions} />
      </div>
    </div>
  );
}
