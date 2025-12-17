import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { DashboardShell } from "@/components/layouts/Shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BusinessForm } from "./BusinessForm";

export const dynamic = "force-dynamic";

async function getOwnerData(userId: string) {
  const [businesses, reviews, categories] = await Promise.all([
    prisma.business.findMany({
      where: { ownerId: userId },
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { reviews: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.findMany({
      where: { business: { ownerId: userId } },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        business: { select: { id: true, name: true, category: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return { businesses, reviews, categories };
}

export default async function OwnerDashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const { businesses, reviews, categories } = userId
    ? await getOwnerData(userId)
    : { businesses: [], reviews: [], categories: [] };

  const stats = {
    businesses: businesses.length,
    reviews: reviews.length,
  };

  return (
    <DashboardShell
      title="Espace Propriétaire"
      description="Gérez vos établissements, répondez aux avis et suivez vos statistiques."
      width="xl"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-600">Établissements</p>
          <p className="text-3xl font-bold text-slate-900">{stats.businesses}</p>
        </Card>
        <Card className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-600">Avis reçus (10 derniers)</p>
          <p className="text-3xl font-bold text-slate-900">{stats.reviews}</p>
        </Card>
        <Card className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-600">Certification</p>
          <p className="text-3xl font-bold text-slate-900">En attente</p>
          <p className="text-xs text-slate-500">Ajoutez des documents via une revendication.</p>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Vos établissements</h2>
            <Link className="text-sm font-semibold text-primary hover:underline" href="/explorer">
              Voir le catalogue
            </Link>
          </div>
          {businesses.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-600">
              Aucun établissement associé. Créez-en un ou faites une demande de revendication.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {businesses.map((biz) => (
                <Card
                  key={biz.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">{biz.name}</h3>
                      <p className="text-xs text-slate-600">
                        {biz.category?.name ?? "Catégorie"} · {biz._count?.reviews ?? 0} avis
                      </p>
                    </div>
                    <Link
                      href={`/business/${biz.id}`}
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      Voir
                    </Link>
                  </div>
                  <p className="mt-2 text-sm text-slate-700 line-clamp-3">
                    {biz.description ?? "Description à compléter."}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Créer un établissement</h2>
          <Card className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <BusinessForm categories={categories} />
          </Card>

          <h2 className="text-lg font-semibold text-slate-900">Avis récents</h2>
          <div className="space-y-3">
            {reviews.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-600">
                Aucun avis pour le moment.
              </p>
            ) : (
              reviews.map((rev) => (
                <Card
                  key={rev.id}
                  className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {rev.business?.name ?? "Établissement"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Note : {rev.rating}/5 · Par {rev.user?.name ?? "Utilisateur"}
                  </p>
                  <p className="mt-1 text-sm text-slate-700 line-clamp-3">{rev.comment}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-primary">
                    <Link href={`/business/${rev.business?.id ?? ""}#reviews`}>Voir la fiche</Link>
                    <Link href={`/review/new?businessId=${rev.business?.id ?? ""}`}>
                      Répondre / Ajouter un avis
                    </Link>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

