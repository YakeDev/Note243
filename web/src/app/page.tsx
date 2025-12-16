import Link from "next/link";
import { StarIcon, MapPinIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

interface BusinessCard {
  id: string;
  name: string;
  description?: string | null;
  category?: { name: string };
  _count?: { reviews: number };
  rating?: number | null;
}

interface CategoryCard {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
}

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

async function getBusinesses(): Promise<BusinessCard[]> {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/business`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

async function getCategories(): Promise<CategoryCard[]> {
  try {
    const res = await fetch("/api/categories", {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const [businesses, categories] = await Promise.all([getBusinesses(), getCategories()]);
  const popular = businesses.slice(0, 3);

  return (
    <div className="bg-white">
      <div className="bg-gradient-to-br from-blue-600 to-primary text-white">
        <header className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold sm:text-4xl">
            Trouver les meilleurs services à Lubumbashi
          </h1>
          <p className="max-w-2xl text-sm text-white/90 sm:text-base">
            Découvrez et évaluez les établissements locaux. Partagez vos expériences avec la
            communauté.
          </p>
          <form
            action="/explorer"
            method="get"
            className="mt-4 flex w-full max-w-2xl items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-md transition hover:border-slate-300 focus-within:border-slate-400"
          >
            <input
              type="text"
              name="search"
              placeholder="Rechercher un restaurant, une clinique, un service..."
              className="flex-1 border-0 bg-transparent text-sm placeholder:text-slate-500 focus:outline-none focus:ring-0"
            />
            <button
              type="submit"
              className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white"
            >
              Chercher
            </button>
          </form>
        </header>
      </div>

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Explorer par catégorie</h2>
              <p className="text-sm text-slate-600">Trouvez rapidement un établissement par secteur.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {cat.icon || cat.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{cat.name}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Établissements populaires</h2>
              <p className="text-sm text-slate-600">Les plus consultés cette semaine.</p>
            </div>
            <Link href="/explorer" className="text-sm font-semibold text-primary hover:underline">
              Voir tout →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((biz) => (
              <div
                key={biz.id}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex-1 space-y-2 p-4">
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    {biz.category?.name ?? "Établissement"}
                  </p>
                  <Link
                    href={`/business/${biz.id}`}
                    className="text-base font-semibold text-slate-900 hover:text-primary"
                  >
                    {biz.name}
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Stars value={biz.rating ?? 4} />
                    <span className="text-xs text-slate-500">
                      {biz._count?.reviews ?? 0} avis
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {biz.description ?? "Description à compléter."}
                  </p>
                </div>
                <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
                  <MapPinIcon className="h-4 w-4 text-primary" />
                  Lubumbashi
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
