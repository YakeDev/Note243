import Link from "next/link";
import { notFound } from "next/navigation";
import { ReviewStatus } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  CheckCircleIcon,
  GlobeAltIcon,
  MapPinIcon,
  PhoneIcon,
  StarIcon,
} from "@/components/icons";
import { ClaimBusinessDialog } from "@/components/ClaimBusinessDialog";

type Props = { params: Promise<{ id: string }> };

function Stars({ value, className = "" }: { value: number; className?: string }) {
  const filled = Math.round(Math.max(0, Math.min(5, value)));
  return (
    <span className={`flex items-center gap-0.5 text-amber-500 ${className}`}>
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

function formatRelativeDate(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return "Aujourd'hui";
  if (diffDays === 1) return "Il y a 1 jour";
  if (diffDays < 30) return `Il y a ${diffDays} jours`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return "Il y a 1 mois";
  if (diffMonths < 12) return `Il y a ${diffMonths} mois`;
  const diffYears = Math.floor(diffMonths / 12);
  return diffYears === 1 ? "Il y a 1 an" : `Il y a ${diffYears} ans`;
}

async function getBusiness(id?: string) {
  if (!id) return null;

  const [business, reviewStats] = await Promise.all([
    prisma.business.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        owner: { select: { id: true, name: true } },
        images: { orderBy: [{ isCover: "desc" }, { createdAt: "desc" }] },
        reviews: {
          where: { status: ReviewStatus.PUBLISHED },
          orderBy: { createdAt: "desc" },
          take: 30,
          include: { user: { select: { id: true, name: true } } },
        },
      },
    }),
    prisma.review.aggregate({
      where: { businessId: id, status: ReviewStatus.PUBLISHED },
      _avg: { rating: true },
      _count: { _all: true },
    }),
  ]);

  if (!business) return null;

  return {
    business,
    stats: {
      average: reviewStats._avg.rating ?? 0,
      count: reviewStats._count?._all ?? 0,
    },
  };
}

export default async function BusinessPage({ params }: Props) {
  const { id } = await params;
  if (!id) return notFound();

  const data = await getBusiness(id);
  if (!data) return notFound();

  const { business, stats } = data;
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const isBusinessOwner = !!userId && business.ownerId === userId;
  const isOwnerAccount = session?.user?.role === "OWNER";
  const canClaim = business.status === "ACTIVE" && isOwnerAccount;

  let claimStatus: "PENDING" | "APPROVED" | "REJECTED" | null = null;
  if (userId) {
    const claim = await prisma.claim.findFirst({
      where: { businessId: business.id, userId },
      orderBy: { createdAt: "desc" },
      select: { status: true },
    });
    claimStatus = claim?.status ?? null;
  }
  const coverImage =
    business.images.find((img) => img.isCover)?.url ||
    business.images[0]?.url ||
    "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1600&q=80";

  const galleryImages = business.images.slice(0, 4);
  const locationLabel = business.address ?? business.city ?? "Lubumbashi";
  const mapQuery = encodeURIComponent(locationLabel || business.name);
  const mapEmbedUrl = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  const isCertified = business.status === "CERTIFIED";

  return (
    <div className="bg-white">
      <div className="relative isolate overflow-hidden bg-slate-900 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{ backgroundImage: `url(${coverImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/75 to-slate-900" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-12 pt-16 sm:px-6 lg:px-8">
          <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur">
            Note243 · {business.city ?? "Lubumbashi"}
          </div>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{business.name}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
              <Stars value={stats.average} />
              <span className="font-semibold text-white">{stats.average.toFixed(1)}</span>
              <span className="text-white/70">{stats.count} avis</span>
            </div>
            {business.category?.name ? (
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                {business.category.name}
              </span>
            ) : null}
            {isCertified ? (
              <span className="flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100">
                <CheckCircleIcon className="h-4 w-4" />
                Certifié Note243
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/review/new?businessId=${business.id}`}
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-primary shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Laisser un avis
            </Link>
            <a
              href={mapLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/15"
            >
              Voir sur la carte
            </a>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.45fr_1fr]">
          <section className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="p-8">
                  <h2 className="text-lg font-semibold text-slate-900">Description</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-700">
                    {business.description ??
                      "Description à compléter. Ajoutez une présentation de l'établissement."}
                  </p>

                  <div className="mt-6 space-y-3 text-sm text-slate-700">
                    {business.phone && (
                      <p className="flex items-center gap-2">
                        <PhoneIcon className="h-4 w-4 text-primary" />
                        {business.phone}
                      </p>
                    )}
                    {locationLabel && (
                      <p className="flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4 text-primary" />
                        {locationLabel}
                      </p>
                    )}
                    {business.website && (
                      <p className="flex items-center gap-2">
                        <GlobeAltIcon className="h-4 w-4 text-primary" />
                        <a
                          href={business.website}
                          className="text-primary underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {business.website.replace(/^https?:\/\//, "")}
                        </a>
                      </p>
                    )}
                  </div>

                  <div className="mt-8">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                      Horaires d'ouverture
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">
                      Horaires non renseignés pour le moment.
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 lg:border-l lg:border-t-0">
                  <div className="h-full w-full overflow-hidden">
                    <iframe
                      title={`Carte de ${business.name}`}
                      src={mapEmbedUrl}
                      className="h-full min-h-[260px] w-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Galerie photos</h2>
                <span className="text-xs font-semibold text-slate-500">
                  {galleryImages.length} photo{galleryImages.length > 1 ? "s" : ""}
                </span>
              </div>
              {galleryImages.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-600">
                  Aucune photo pour l'instant.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {galleryImages.map((img) => (
                    <div
                      key={img.id}
                      className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm"
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center transition duration-300 group-hover:scale-105"
                        style={{ backgroundImage: `url(${img.url})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/15 to-transparent" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Coordonnées</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                {locationLabel && (
                  <p className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-primary" />
                    {locationLabel}
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
                    <a
                      href={business.website}
                      className="text-primary underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {business.website.replace(/^https?:\/\//, "")}
                    </a>
                  </p>
                )}
              </div>
              <div className="mt-6 rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary">
                Contactez l'équipe Note243 pour mettre à jour cette fiche ou ajouter des horaires.
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Proprietaire</h2>
              <div className="mt-4 text-sm text-slate-700">
                {business.owner ? (
                  <p>
                    Fiche revendiquee par{" "}
                    <span className="font-semibold text-slate-900">
                      {business.owner.name ?? "Proprietaire"}
                    </span>
                    .
                  </p>
                ) : (
                  <p>Aucun proprietaire associe pour le moment.</p>
                )}
              </div>

              <div className="mt-4 space-y-2">
                {isBusinessOwner ? (
                  <p className="text-xs font-semibold text-emerald-600">
                    Vous etes proprietaire de cette fiche.
                  </p>
                ) : null}
                {!isBusinessOwner ? (
                  !session?.user ? (
                    <Link
                      href={`/auth/login?callbackUrl=/business/${business.id}`}
                      className="inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                    >
                      Se connecter pour revendiquer
                    </Link>
                  ) : !isOwnerAccount ? (
                    <p className="text-xs text-slate-600">
                      Le compte proprietaire est requis pour revendiquer une fiche. Contactez un
                      administrateur pour convertir votre compte.
                    </p>
                  ) : canClaim ? (
                    <ClaimBusinessDialog
                      businessId={business.id}
                      businessName={business.name}
                      initialStatus={claimStatus}
                    />
                  ) : (
                    <p className="text-xs text-slate-500">
                      La revendication est indisponible pour cette fiche.
                    </p>
                  )
                ) : null}
              </div>
            </div>
          </aside>
        </div>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Avis des utilisateurs</h2>
              <p className="text-sm text-slate-600">
                {stats.count} avis publiés · moyenne {stats.average.toFixed(1)}/5
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm">
                Tous
              </button>
              <button className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700">
                Positifs
              </button>
              <button className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700">
                Négatifs
              </button>
              <button className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700">
                Récents
              </button>
            </div>
          </div>

          {business.reviews.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-600">
              Pas encore d'avis. Soyez le premier à partager votre expérience !
            </p>
          ) : (
            <div className="space-y-4">
              {business.reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {review.user?.name ?? "Utilisateur"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatRelativeDate(new Date(review.createdAt))}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Stars value={review.rating} />
                      <span className="text-xs font-semibold text-slate-700">
                        {review.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{review.comment}</p>
                  {review.ownerReply ? (
                    <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
                        Reponse du proprietaire
                      </p>
                      <p className="mt-2 whitespace-pre-wrap">{review.ownerReply}</p>
                    </div>
                  ) : null}
                  <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-slate-500">
                    <button className="hover:text-primary">Signaler</button>
                    <button className="hover:text-primary">Répondre</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
