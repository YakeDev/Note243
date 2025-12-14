import Link from "next/link";

type Business = {
  id: string;
  name: string;
  description?: string | null;
  city?: string | null;
  _count?: { reviews: number };
  averageRating?: number | null;
};

type CategoryDetail = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  _count?: { businesses: number; children: number };
  children?: { id: string; name: string; slug: string }[];
  businesses: Business[];
};

async function getCategory(slug: string, query: URLSearchParams): Promise<CategoryDetail | null> {
  const qs = query.toString();
  const url = `/api/categories/${slug}${qs ? `?${qs}` : ""}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

function Rating({ value }: { value: number }) {
  const rounded = Math.round(value);
  return (
    <span className="text-sm text-amber-500">
      {"★".repeat(Math.max(0, rounded))}
      {"☆".repeat(Math.max(0, 5 - rounded))}
    </span>
  );
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const query = new URLSearchParams();
  const search =
    typeof searchParams?.search === "string" && searchParams.search.length > 0
      ? searchParams.search
      : "";
  const rating = typeof searchParams?.rating === "string" ? searchParams.rating : "";
  const city =
    typeof searchParams?.city === "string" && searchParams.city.length > 0
      ? searchParams.city
      : "";
  const sort = typeof searchParams?.sort === "string" ? searchParams.sort : "recent";

  if (search) query.set("search", search);
  if (rating) query.set("rating", rating);
  if (city) query.set("city", city);
  if (sort) query.set("sort", sort);

  const category = await getCategory(params.slug, query);

  if (!category) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-center text-slate-700">Catégorie introuvable.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50">
      <div className="bg-gradient-to-r from-primary to-blue-500 text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-lg font-semibold">
              {category.icon ?? category.name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-white/80">Catégorie</p>
              <h1 className="text-3xl font-bold">{category.name}</h1>
              <p className="max-w-3xl text-sm text-white/90">
                {category.description ?? "Explorez les établissements de cette catégorie."}
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-white/20 px-3 py-1">
                  {category._count?.businesses ?? 0} établissements
                </span>
                {category.children && category.children.length > 0 && (
                  <span className="rounded-full bg-white/20 px-3 py-1">
                    {category.children.length} sous-catégories
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <form
          method="get"
          className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4"
        >
          <div className="lg:col-span-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="search">
              Recherche
            </label>
            <div className="mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-primary">
              <span className="text-slate-400">🔍</span>
              <input
                id="search"
                name="search"
                defaultValue={search}
                placeholder="Nom ou description..."
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="rating">
              Note minimale
            </label>
            <select
              id="rating"
              name="rating"
              defaultValue={rating}
              className="mt-1 w-full rounded-lg border-slate-200 text-sm focus:border-primary focus:ring-primary"
            >
              <option value="">Toutes</option>
              <option value="5">5 et plus</option>
              <option value="4">4 et plus</option>
              <option value="3">3 et plus</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="city">
              Quartier / Ville
            </label>
            <input
              id="city"
              name="city"
              defaultValue={city}
              placeholder="Ex: Lubumbashi"
              className="mt-1 w-full rounded-lg border-slate-200 text-sm focus:border-primary focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="sort">
              Trier par
            </label>
            <select
              id="sort"
              name="sort"
              defaultValue={sort}
              className="mt-1 w-full rounded-lg border-slate-200 text-sm focus:border-primary focus:ring-primary"
            >
              <option value="recent">Plus récents</option>
              <option value="popularity">Popularité</option>
              <option value="rating">Meilleure note</option>
            </select>
          </div>
          <div className="flex items-center justify-end gap-3 lg:col-span-4">
            <Link
              href={`/categories/${params.slug}`}
              className="text-sm font-medium text-slate-600 underline underline-offset-4"
            >
              Réinitialiser
            </Link>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              Appliquer les filtres
            </button>
          </div>
        </form>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {category.businesses.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-600">
                Aucun établissement dans cette catégorie pour les filtres choisis.
              </p>
            ) : (
              category.businesses.map((biz) => (
                <article
                  key={biz.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-semibold text-slate-900">{biz.name}</h3>
                      {biz.averageRating != null && (
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <Rating value={biz.averageRating} />
                          <span className="font-semibold">
                            {biz.averageRating.toFixed(1)} · {biz._count?.reviews ?? 0} avis
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {biz.description ?? "Description à compléter."}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      {biz.city && (
                        <span className="rounded-full bg-slate-100 px-3 py-1">{biz.city}</span>
                      )}
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                        Établissement vérifié
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/business/${biz.id}`}
                    className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
                  >
                    Voir la fiche
                  </Link>
                </article>
              ))
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-900">Sous-catégories</h4>
              <div className="mt-3 flex flex-col gap-2">
                {category.children && category.children.length > 0 ? (
                  category.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/categories/${child.slug}`}
                      className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm font-medium text-slate-800 transition hover:border-primary hover:text-primary"
                    >
                      <span>{child.name}</span>
                      <span className="text-xs text-slate-500">→</span>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-slate-600">Pas de sous-catégorie.</p>
                )}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-primary/5 p-4 text-sm text-slate-800">
              <h4 className="text-sm font-semibold text-slate-900">Besoin d&apos;aide ?</h4>
              <p className="mt-2">
                Vous êtes propriétaire d&apos;un établissement et vous ne trouvez pas la bonne
                catégorie ? Contactez le support ou proposez une nouvelle catégorie.
              </p>
              <Link href="/contact" className="mt-3 inline-block text-primary hover:underline">
                Contacter le support
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
