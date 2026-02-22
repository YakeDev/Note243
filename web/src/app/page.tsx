import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import { BusinessStatus, Prisma, ReviewStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PageShell, SectionHeader } from "@/components/layouts/Shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AcademicCapIcon,
  BriefcaseIcon,
  BuildingOffice2Icon,
  ComputerDesktopIcon,
  HeartIcon,
  HomeModernIcon,
  MapPinIcon,
  ShoppingBagIcon,
  StarIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
} from "@/components/icons";

export const dynamic = "force-dynamic";

type Filters = {
  q: string | null;
  category: string | null;
  city: string | null;
  minRating: number | null;
};

type BusinessResult = {
  id: string;
  name: string;
  description: string | null;
  city: string | null;
  category: { name: string; slug: string };
  rating: number;
  reviewCount: number;
};

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
};

type RecentReview = {
  id: string;
  rating: number;
  comment: string;
  business: {
    id: string;
    name: string;
    city: string | null;
  };
};

const MAX_TEXT_LENGTH = 120;
const BUSINESS_LIMIT = 12;

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { title?: string; titleId?: string }>;

const iconMap: Record<string, IconComponent> = {
  ShoppingBagIcon,
  HomeModernIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  BuildingOffice2Icon,
  HeartIcon,
  WrenchScrewdriverIcon,
  ComputerDesktopIcon,
  TruckIcon,
};

function getCategoryIcon(name?: string | null): IconComponent | null {
  if (!name) return null;
  return iconMap[name] ?? null;
}

function clampRating(value: number): number {
  return Math.max(1, Math.min(5, value));
}

function sanitizeText(value: string | string[] | undefined): string | null {
  if (!value) return null;
  const raw = Array.isArray(value) ? value[0] ?? "" : value;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, MAX_TEXT_LENGTH);
}

type SearchParams = Record<string, string | string[] | undefined>;
type SearchParamsInput = SearchParams | Promise<SearchParams> | undefined;

function parseSearchParams(searchParams: SearchParams | undefined): Filters {
  const safeParams = searchParams ?? {};
  const q = sanitizeText(safeParams.q);
  const category = sanitizeText(safeParams.category);
  const city = sanitizeText(safeParams.city);

  const minRatingRaw = Array.isArray(safeParams.minRating)
    ? safeParams.minRating[0]
    : safeParams.minRating;

  let minRating: number | null = null;
  if (minRatingRaw) {
    const parsed = Number.parseInt(minRatingRaw, 10);
    if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 5) {
      minRating = clampRating(parsed);
    }
  }

  return { q, category, city, minRating };
}

function buildWhere(filters: Filters): Prisma.BusinessWhereInput {
  const conditions: Prisma.BusinessWhereInput[] = [];

  conditions.push({
    status: { in: [BusinessStatus.ACTIVE, BusinessStatus.CERTIFIED] },
  });

  if (filters.q) {
    const mode = Prisma.QueryMode.insensitive;
    conditions.push({
      OR: [
        { name: { contains: filters.q, mode } },
        { description: { contains: filters.q, mode } },
        { city: { contains: filters.q, mode } },
      ],
    });
  }

  if (filters.category) {
    conditions.push({
      category: { is: { slug: filters.category } },
    });
  }

  if (filters.city) {
    conditions.push({
      city: { equals: filters.city, mode: Prisma.QueryMode.insensitive },
    });
  }

  return conditions.length ? { AND: conditions } : {};
}

async function getCategories(): Promise<CategoryItem[]> {
  return prisma.category.findMany({
    where: { parentId: null },
    select: { id: true, name: true, slug: true, icon: true },
    orderBy: { name: "asc" },
  });
}

async function getBusinesses(filters: Filters): Promise<BusinessResult[]> {
  const where = buildWhere(filters);

  const ratingAggregates = await prisma.review.groupBy({
    by: ["businessId"],
    where: {
      status: ReviewStatus.PUBLISHED,
      business: { is: where },
    },
    ...(filters.minRating !== null
      ? { having: { rating: { _avg: { gte: filters.minRating } } } }
      : {}),
    _avg: { rating: true },
    _count: { rating: true },
    orderBy: [{ _avg: { rating: "desc" } }, { _count: { rating: "desc" } }],
    take: BUSINESS_LIMIT,
  });

  const aggregateMap = new Map(
    ratingAggregates.map((agg, index) => [agg.businessId, { ...agg, index }]),
  );
  const ratedIds = ratingAggregates.map((agg) => agg.businessId);

  const ratedBusinesses = ratedIds.length
    ? await prisma.business.findMany({
        where: { AND: [where, { id: { in: ratedIds } }] },
        select: {
          id: true,
          name: true,
          description: true,
          city: true,
          category: { select: { name: true, slug: true } },
        },
      })
    : [];

  const ratedWithScores: BusinessResult[] = ratedBusinesses
    .map((biz) => {
      const aggregate = aggregateMap.get(biz.id);
      const rating = aggregate?._avg.rating ?? 0;
      const reviewCount = aggregate?._count.rating ?? 0;

      return {
        ...biz,
        rating,
        reviewCount,
      };
    })
    .sort((a, b) => {
      const rankA = aggregateMap.get(a.id)?.index ?? 0;
      const rankB = aggregateMap.get(b.id)?.index ?? 0;
      return rankA - rankB;
    });

  if (filters.minRating !== null || ratedWithScores.length >= BUSINESS_LIMIT) {
    return ratedWithScores.slice(0, BUSINESS_LIMIT);
  }

  const remaining = await prisma.business.findMany({
    where: {
      AND: [where, ratedIds.length ? { id: { notIn: ratedIds } } : {}],
    },
    select: {
      id: true,
      name: true,
      description: true,
      city: true,
      category: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: BUSINESS_LIMIT - ratedWithScores.length,
  });

  const unrated: BusinessResult[] = remaining.map((biz) => ({
    ...biz,
    rating: 0,
    reviewCount: 0,
  }));

  return [...ratedWithScores, ...unrated].slice(0, BUSINESS_LIMIT);
}

async function getRecentReviews(): Promise<RecentReview[]> {
  return prisma.review.findMany({
    where: { status: ReviewStatus.PUBLISHED },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: {
      id: true,
      rating: true,
      comment: true,
      business: { select: { id: true, name: true, city: true } },
    },
  });
}

function Stars({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(value, 5));
  const filled = Math.round(clamped);
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

function ReviewSnippet({ text }: { text: string }) {
  if (text.length <= 180) return <p className="text-sm text-slate-600">{text}</p>;
  return <p className="text-sm text-slate-600">{`${text.slice(0, 177)}...`}</p>;
}

export default async function Home({ searchParams }: { searchParams?: SearchParamsInput }) {
  // In React 19 / Next 16, searchParams is a Promise in RSC. Await it if needed.
  const resolvedSearchParams =
    searchParams && typeof (searchParams as any).then === "function"
      ? await (searchParams as Promise<SearchParams>)
      : (searchParams as SearchParams | undefined);

  const filters = parseSearchParams(resolvedSearchParams);
  const hasActiveFilters = Boolean(
    filters.q || filters.category || filters.city || filters.minRating,
  );

  const [categories, businesses, recentReviews] = await Promise.all([
    getCategories(),
    getBusinesses(filters),
    getRecentReviews(),
  ]);

  return (
    <div className="bg-slate-50">
      <div className="bg-gradient-to-br from-blue-600 via-blue-600 to-primary text-white shadow-inner">
        <PageShell className="flex flex-col gap-5 py-16 text-center sm:gap-6" width="xl">
          <p className="text-xs uppercase tracking-[0.2em] text-white/70">
            Note243 · Avis locaux
          </p>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
            Trouvez les meilleurs services à Lubumbashi
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-white/85 sm:text-base">
            Découvrez, comparez et partagez vos retours sur les établissements de la ville. Les avis récents guident toute la communauté.
          </p>
          <Card className="border-white/15 bg-white/10 backdrop-blur">
            <CardContent className="p-4 sm:p-6">
              <form
                action="/"
                method="get"
                className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-[1.2fr,1fr,1fr,0.7fr,auto]"
              >
                <input
                  type="text"
                  name="q"
                  aria-label="Recherche"
                  defaultValue={filters.q ?? ""}
                  placeholder="Rechercher un restaurant, une clinique, un service..."
                  maxLength={MAX_TEXT_LENGTH}
                  className="h-12 rounded-lg border border-white/30 bg-white/90 px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <select
                  name="category"
                  aria-label="Catégorie"
                  defaultValue={filters.category ?? ""}
                  className="h-12 rounded-lg border border-white/30 bg-white/90 px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  name="city"
                  aria-label="Ville"
                  defaultValue={filters.city ?? ""}
                  placeholder="Ville (ex: Lubumbashi)"
                  maxLength={MAX_TEXT_LENGTH}
                  className="h-12 rounded-lg border border-white/30 bg-white/90 px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="number"
                  name="minRating"
                  aria-label="Note minimale"
                  defaultValue={filters.minRating ?? ""}
                  min={1}
                  max={5}
                  inputMode="numeric"
                  placeholder="Note mini"
                  className="h-12 rounded-lg border border-white/30 bg-white/90 px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button type="submit" className="h-12 rounded-lg bg-white px-4 text-sm font-semibold text-primary shadow-sm transition hover:shadow-md">
                  Chercher
                </Button>
              </form>
            </CardContent>
          </Card>
        </PageShell>
      </div>

      <PageShell className="space-y-12 py-12" width="xl">
        <section className="space-y-6">
          <SectionHeader
            title="Explorer par catégorie"
            description="Sélectionnez un secteur pour filtrer les résultats."
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/?category=${encodeURIComponent(cat.slug)}`}
                className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary ring-1 ring-primary/15">
                    {(() => {
                      const Icon = getCategoryIcon(cat.icon);
                      if (Icon) {
                        return <Icon className="h-5 w-5" aria-hidden="true" />;
                      }
                      return cat.name ? cat.name.charAt(0).toUpperCase() : "?";
                    })()}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold text-slate-900">{cat.name}</p>
                    <span className="text-xs text-slate-500 group-hover:text-primary">
                      Voir les établissements
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <SectionHeader
            title={hasActiveFilters ? "Résultats" : "Établissements populaires"}
            description="Classement par note moyenne puis par volume d'avis."
            actions={
              hasActiveFilters ? (
                <Link href="/" className="text-sm font-semibold text-primary hover:underline">
                  Effacer les filtres
                </Link>
              ) : null
            }
          />

          {businesses.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-600">
              Aucun résultat trouvé. Essayez un autre terme ou réduisez les filtres.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {businesses.map((biz) => {
                const hasReviews = biz.reviewCount > 0;
                const ratingLabel = hasReviews ? biz.rating.toFixed(1) : "Aucun avis";
                return (
                  <Card
                    key={biz.id}
                    className="flex h-full flex-col overflow-hidden border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <CardContent className="flex-1 space-y-2 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase text-slate-500">
                          {biz.category?.name ?? "Établissement"}
                        </p>
                        {hasReviews ? (
                          <Badge variant="muted">{ratingLabel}</Badge>
                        ) : (
                          <Badge variant="outline">Nouveau</Badge>
                        )}
                      </div>
                      <Link
                        href={`/business/${biz.id}`}
                        className="text-base font-semibold text-slate-900 hover:text-primary"
                      >
                        {biz.name}
                      </Link>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Stars value={biz.rating} />
                        <span className="text-xs text-slate-500">{ratingLabel}</span>
                        <span className="text-xs text-slate-500">
                          {biz.reviewCount} avis
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {biz.description ?? "Description à compléter."}
                      </p>
                    </CardContent>
                    <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
                      <MapPinIcon className="h-4 w-4 text-primary" />
                      {biz.city ?? "Lubumbashi"}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-6">
          <SectionHeader
            title="Avis récents"
            description="Derniers retours vérifiés de la communauté."
          />
          <div className="grid gap-4 md:grid-cols-2">
            {recentReviews.map((review) => (
              <article
                key={review.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Link
                      href={`/business/${review.business.id}`}
                      className="text-sm font-semibold text-slate-900 hover:text-primary"
                    >
                      {review.business.name}
                    </Link>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPinIcon className="h-3 w-3 text-primary" />
                      {review.business.city ?? "Lubumbashi"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Stars value={review.rating} />
                    <span className="text-xs font-semibold text-slate-700">
                      {review.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <ReviewSnippet text={review.comment} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl bg-primary px-6 py-10 text-white shadow-sm sm:px-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-white/70">
                Propriétaires
              </p>
              <h3 className="text-2xl font-bold">Revendiquer votre fiche</h3>
              <p className="max-w-xl text-sm text-white/80">
                Mettez à jour vos informations, répondez aux avis et gagnez la confiance
                des clients de Lubumbashi. Nous vérifions chaque demande.
              </p>
            </div>
            <Link
              href="/owner"
              prefetch={false}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-primary shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:mt-0"
            >
              Devenir partenaire
            </Link>
          </div>
        </section>
      </PageShell>
    </div>
  );
}
