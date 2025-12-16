import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StarIcon, MapPinIcon, PhoneIcon, GlobeAltIcon, CheckCircleIcon } from "@/components/icons";

type Props = { params: Promise<{ id: string }> };

function Stars({ value }: { value: number }) {
  const filled = Math.round(value);
  return (
    <span className="flex items-center gap-0.5 text-amber-500">
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon
          key={n}
          className={`h-4 w-4 ${
            n <= filled ? "fill-amber-400" : "fill-transparent stroke-amber-400"
          }`}
        />
      ))}
    </span>
  );
}

async function getBusiness(id?: string) {
  if (!id) return null;
  return prisma.business.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      owner: { select: { id: true, name: true } },
      reviews: {
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true } } },
      },
      _count: { select: { reviews: true } },
    },
  });
}

export default async function BusinessPage({ params }: Props) {
  const { id } = await params;
  if (!id) return notFound();

  const business = await getBusiness(id);
  if (!business) return notFound();

  const avg =
    business.reviews.length === 0
      ? 0
      : business.reviews.reduce((acc, r) => acc + r.rating, 0) / business.reviews.length;

  return (
    <div className="bg-white">
      <div className="bg-slate-900 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Note243</p>
          <h1 className="text-3xl font-bold">{business.name}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
            <span className="flex items-center gap-2">
              <Stars value={avg} />
              <span className="font-semibold text-white">{avg.toFixed(1)}</span>
              <span className="text-white/70">{business._count.reviews} avis</span>
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
              {business.category?.name ?? "Etablissement"}
            </span>
            <span className="flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100">
              <CheckCircleIcon className="h-4 w-4" />
              Certifié Note243
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <section className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Description</h2>
              <p className="mt-2 text-sm text-slate-700">
                {business.description ??
                  "Description à compléter. Ajoutez une présentation de l'établissement."}
              </p>
              <div className="mt-4 space-y-2 text-sm text-slate-700">
                {business.phone && (
                  <p className="flex items-center gap-2">
                    <PhoneIcon className="h-4 w-4 text-primary" />
                    {business.phone}
                  </p>
                )}
                {business.address && (
                  <p className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-primary" />
                    {business.address}
                  </p>
                )}
                {business.website && (
                  <p className="flex items-center gap-2">
                    <GlobeAltIcon className="h-4 w-4 text-primary" />
                    <a href={business.website} className="text-primary underline" target="_blank">
                      {business.website}
                    </a>
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Avis des utilisateurs</h2>
                <Link
                  href={`/review/new?businessId=${business.id}`}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Laisser un avis
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {business.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">
                        {review.user?.name ?? "Utilisateur"}
                      </p>
                      <Stars value={review.rating} />
                    </div>
                    <p className="mt-1 text-sm text-slate-700">{review.comment}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {business.reviews.length === 0 && (
                  <p className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-600">
                    Aucun avis pour l’instant.
                  </p>
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Coordonnées</h2>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                {business.address && (
                  <p className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-primary" />
                    {business.address}
                  </p>
                )}
                {business.phone && (
                  <p className="flex items-center gap-2">
                    <PhoneIcon className="h-4 w-4 text-primary" />
                    {business.phone}
                  </p>
                )}
                {business.website && (
                  <p className="flex items-center gap-2">
                    <GlobeAltIcon className="h-4 w-4 text-primary" />
                    <a href={business.website} className="text-primary underline" target="_blank">
                      {business.website}
                    </a>
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
