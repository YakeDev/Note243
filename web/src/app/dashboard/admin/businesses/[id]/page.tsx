import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UploadBusinessImages } from "@/components/UploadBusinessImages";
import { BusinessImagesManager } from "@/components/BusinessImagesManager";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

async function getBusiness(id?: string) {
  if (!id) return null;
  return prisma.business.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      owner: { select: { id: true, name: true, email: true } },
      images: { orderBy: [{ isCover: "desc" }, { createdAt: "asc" }] },
    },
  });
}

export default async function AdminBusinessImagesPage({ params }: Props) {
  const { id } = await params;
  const business = await getBusiness(id);
  if (!business) return notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Images</p>
          <h1 className="text-2xl font-bold text-slate-900">{business.name}</h1>
          <p className="text-sm text-slate-600">
            {business.category?.name ?? "Categorie"} ·{" "}
            {business.owner ? `${business.owner.name ?? ""} (${business.owner.email})` : "Sans proprietaire"}
          </p>
        </div>
        <Link
          href="/dashboard/admin/businesses"
          className="text-sm font-semibold text-primary hover:underline"
        >
          Retour a la liste
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Ajouter des images</h2>
          <p className="mt-1 text-sm text-slate-600">
            Telechargez des photos et choisissez une cover.
          </p>
          <div className="mt-4">
            <UploadBusinessImages businessId={business.id} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Galerie et cover</h2>
          <p className="mt-1 text-sm text-slate-600">
            Definissez l&apos;image de cover ou supprimez une photo.
          </p>
          <div className="mt-4">
            <BusinessImagesManager businessId={business.id} initialImages={business.images} />
          </div>
        </div>
      </div>
    </div>
  );
}
