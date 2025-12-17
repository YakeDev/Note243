import Link from "next/link";
import { BusinessStatus } from "@prisma/client";
import { StarIcon, ShieldCheckIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

type SortOption = "recent" | "reviews" | "rating";

interface BusinessCard {
  id: string;
  name: string;
  description?: string | null;
  city?: string | null;
  category?: { name: string };
  _count?: { reviews: number };
  status?: BusinessStatus;
  rating?: number;
}

async function getBusinesses(params: {
  search?: string;
  sort?: SortOption;
  minRating?: number | null;
}): Promise<BusinessCard[]> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.sort) query.set("sort", params.sort);
  if (params.minRating) query.set("minRating", String(params.minRating));

  const qs = query.toString();
  const base = getBaseUrl();

  try {
    const res = await fetch(`${base}/api/business${qs ? `?${qs}` : ""}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export default async function ExplorerPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const sort =
    typeof params.sort === "string" && ["recent", "reviews", "rating"].includes(params.sort)
      ? (params.sort as SortOption)
      : "recent";
  const parsedRating = typeof params.minRating === "string" ? Number(params.minRating) : null;
  const minRating =
    parsedRating && Number.isFinite(parsedRating)
      ? Math.min(Math.max(parsedRating, 1), 5)
      : null;

  const businesses = await getBusinesses({ search, sort, minRating });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Explorer</h1>
          <p className="mt-2 text-slate-700">
            Parcourez les établissements et lisez les avis.
            {search ? ` Résultats pour "${search}".` : ""}
          </p>
        </div>
      </div>

      <form className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-12">
        <label className="md:col-span-6">
          <span className="text-sm font-semibold text-slate-700">Recherche</span>
          <input
            type="search"
            name="search"
            defaultValue={search ?? ""}
            placeholder="Nom, description, ville..."
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </label>

        <label className="md:col-span-3">
          <span className="text-sm font-semibold text-slate-700">Tri</span>
          <select
            name="sort"
            defaultValue={sort}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          >
            <option value="recent">Plus récents</option>
            <option value="reviews">Plus d’avis</option>
            <option value="rating">Mieux notés</option>
          </select>
        </label>

        <label className="md:col-span-2">
          <span className="text-sm font-semibold text-slate-700">Note min.</span>
          <select
            name="minRating"
            defaultValue={minRating?.toString() ?? ""}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Toutes</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5</option>
          </select>
        </label>

        <div className="flex items-end gap-3 md:col-span-1">
          <button
            type="submit"
            className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            Filtrer
          </button>
          <Link
            href="/explorer"
            className="hidden rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary md:inline-flex"
          >
            Réinitialiser
          </Link>
        </div>
      </form>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {businesses.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-slate-600">
            Aucun établissement trouvé. Ajoutez-en via l’API ou l’admin.
          </div>
        )}

        {businesses.map((biz) => (
          <article
            key={biz.id}
            className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="h-32 w-full bg-gradient-to-r from-primary/10 to-primary/5" />
            <div className="flex flex-1 flex-col gap-2 p-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>{biz.category?.name ?? "Catégorie"}</span>
                <span className="text-slate-500">{biz._count?.reviews ?? 0} avis</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {biz.status === BusinessStatus.CERTIFIED && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                    <ShieldCheckIcon className="h-4 w-4" /> Vérifié
                  </span>
                )}
                {typeof biz.rating === "number" && biz.rating > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800">
                    <StarIcon className="h-4 w-4" />
                    {biz.rating.toFixed(1)}
                  </span>
                )}
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
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
