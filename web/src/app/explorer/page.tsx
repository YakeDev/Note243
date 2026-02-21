import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PageShell, SectionHeader } from "@/components/layouts/Shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;
type SearchParams = Record<string, string | string[] | undefined>;
type SearchParamsInput = SearchParams | Promise<SearchParams> | undefined;

interface BusinessCard {
  id: string;
  name: string;
  description?: string | null;
  city?: string | null;
  category?: { name: string };
  _count?: { reviews: number };
  images?: { url: string; isCover: boolean }[];
}

type BusinessResults = {
  items: BusinessCard[];
  total: number;
  totalPages: number;
  page: number;
};

function getPaginationItems(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: Array<number | "ellipsis"> = [1];
  const left = Math.max(2, currentPage - 1);
  const right = Math.min(totalPages - 1, currentPage + 1);

  if (left > 2) items.push("ellipsis");
  for (let page = left; page <= right; page += 1) {
    items.push(page);
  }
  if (right < totalPages - 1) items.push("ellipsis");
  items.push(totalPages);

  return items;
}

async function getBusinesses(search?: string, page = 1): Promise<BusinessResults> {
  const q = search?.trim();

  const where: Prisma.BusinessWhereInput =
    q && q.length > 0
      ? {
          OR: [
            { name: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { description: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { city: { contains: q, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};

  const total = await prisma.business.count({ where });
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const safePage = totalPages > 0 ? Math.min(Math.max(page, 1), totalPages) : 1;

  const items = await prisma.business.findMany({
    where,
    select: {
      id: true,
      name: true,
      description: true,
      city: true,
      category: { select: { name: true } },
      _count: { select: { reviews: true } },
      images: {
        select: { url: true, isCover: true },
        orderBy: [{ isCover: "desc" }, { createdAt: "desc" }],
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
    skip: (safePage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return { items, total, totalPages, page: safePage };
}

export default async function ExplorerPage({
  searchParams,
}: {
  searchParams?: SearchParamsInput;
}) {
  const resolvedSearchParams =
    searchParams && typeof (searchParams as Promise<SearchParams>).then === "function"
      ? await (searchParams as Promise<SearchParams>)
      : (searchParams as SearchParams | undefined);

  const search =
    typeof resolvedSearchParams?.search === "string" &&
    resolvedSearchParams.search.trim().length > 0
      ? resolvedSearchParams.search.trim()
      : undefined;

  const pageParam =
    typeof resolvedSearchParams?.page === "string" ? resolvedSearchParams.page : undefined;
  const parsedPage = pageParam ? Number.parseInt(pageParam, 10) : 1;
  const currentPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const { items: businesses, totalPages, page: safePage } = await getBusinesses(
    search,
    currentPage,
  );
  const pageItems = totalPages > 1 ? getPaginationItems(safePage, totalPages) : [];

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return query ? `/explorer?${query}` : "/explorer";
  };

  return (
    <PageShell className="space-y-8 py-12" width="xl">
      <SectionHeader
        title="Explorer"
        description={
          search
            ? `Parcourez les établissements et lisez les avis. Résultats pour "${search}".`
            : "Parcourez les établissements et lisez les avis."
        }
        actions={
          <form
            action="/explorer"
            method="get"
            className="flex w-full max-w-md items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-slate-300"
          >
            <input
              type="text"
              name="search"
              aria-label="Rechercher"
              defaultValue={search ?? ""}
              placeholder="Rechercher un établissement..."
              className="w-full border-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
            />
            <Button type="submit" size="sm" variant="default">
              Chercher
            </Button>
          </form>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {businesses.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-slate-600">
            Aucun établissement trouvé. Affinez votre recherche ou ajoutez des données via l'admin.
          </div>
        )}

        {businesses.map((biz) => (
          <Card
            key={biz.id}
            className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative h-32 w-full bg-gradient-to-r from-primary/10 to-primary/5">
              {biz.images?.[0]?.url ? (
                <img
                  src={biz.images[0].url}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : null}
            </div>
            <CardContent className="flex flex-1 flex-col gap-2 p-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>{biz.category?.name ?? "Catégorie"}</span>
                <Badge variant="outline">{biz._count?.reviews ?? 0} avis</Badge>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{biz.name}</h3>
              <p className="text-sm text-slate-700 line-clamp-3">
                {biz.description ?? "Description à compléter."}
              </p>
              <p className="text-xs text-slate-500">{biz.city ?? "Lubumbashi"}</p>
              <div className="mt-auto pt-2">
                <Link
                  href={`/business/${biz.id}`}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
                >
                  Voir la fiche
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <nav
          className="flex flex-wrap items-center justify-center gap-2"
          aria-label="Pagination"
        >
          {safePage > 1 ? (
            <Link
              href={buildPageUrl(safePage - 1)}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary"
            >
              Precedent
            </Link>
          ) : (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-400">
              Precedent
            </span>
          )}

          {pageItems.map((item, index) =>
            item === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="px-2 text-sm text-slate-400">
                ...
              </span>
            ) : (
              <Link
                key={item}
                href={buildPageUrl(item)}
                className={
                  item === safePage
                    ? "rounded-full border border-primary bg-primary px-4 py-2 text-sm font-semibold text-white"
                    : "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary"
                }
                aria-current={item === safePage ? "page" : undefined}
              >
                {item}
              </Link>
            ),
          )}

          {safePage < totalPages ? (
            <Link
              href={buildPageUrl(safePage + 1)}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary"
            >
              Suivant
            </Link>
          ) : (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-400">
              Suivant
            </span>
          )}
        </nav>
      )}
    </PageShell>
  );
}
