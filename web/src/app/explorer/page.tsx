import Link from "next/link";

export const dynamic = "force-dynamic";

interface BusinessCard {
  id: string;
  name: string;
  description?: string | null;
  city?: string | null;
  category?: { name: string };
  _count?: { reviews: number };
}

async function getBusinesses(search?: string): Promise<BusinessCard[]> {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  const base = getBaseUrl();
  try {
    const res = await fetch(`${base}/api/business${qs}`, {
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
  const businesses = await getBusinesses(search);

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
