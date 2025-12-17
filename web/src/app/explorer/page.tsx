import Link from "next/link";
import { PageShell, SectionHeader } from "@/components/layouts/Shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";

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
  try {
    const res = await fetch(`/api/business${qs}`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function ExplorerPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const search = typeof searchParams?.search === "string" ? searchParams.search : undefined;
  const businesses = await getBusinesses(search);

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
            <div className="h-32 w-full bg-gradient-to-r from-primary/10 to-primary/5" />
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
    </PageShell>
  );
}
