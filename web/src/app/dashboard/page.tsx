import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StarIcon } from "@/components/icons";
import { DashboardShell } from "@/components/layouts/Shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { UserSidebar } from "@/components/dashboard/UserSidebar";

function Stars({ value }: { value: number }) {
  const filled = Math.round(value);
  return (
    <span className="flex items-center gap-0.5 text-amber-500">
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon
          key={n}
          className={`h-4 w-4 ${n <= filled ? "fill-amber-400" : "fill-transparent stroke-amber-400"}`}
        />
      ))}
    </span>
  );
}

async function getUserData(userId: string) {
  const [user, reviews, favorites] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        _count: { select: { reviews: true, favorites: true } },
      },
    }),
    prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        business: { select: { id: true, name: true, category: { select: { name: true } } } },
      },
    }),
    prisma.favorite.findMany({
      where: { userId },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            category: { select: { name: true } },
            _count: { select: { reviews: true } },
          },
        },
      },
    }),
  ]);

  return { user, reviews, favorites };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <DashboardShell
        title="Tableau de bord"
        description="Connectez-vous pour accéder à vos avis et favoris."
        width="lg"
      >
        <p className="text-sm text-slate-700">Connectez-vous pour voir votre tableau de bord.</p>
      </DashboardShell>
    );
  }

  const { user, reviews, favorites } = await getUserData(session.user.id);

  return (
    <DashboardShell
      title={`Bienvenue, ${user?.name ?? "Utilisateur"}.`}
      description="Gérez vos avis et favoris en un seul endroit."
      width="xl"
    >
      <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
        <UserSidebar />
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold text-slate-500">Avis laissés</p>
              <p className="text-3xl font-bold text-slate-900">{user?._count.reviews ?? 0}</p>
            </Card>
            <Card className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold text-slate-500">Favoris enregistrés</p>
              <p className="text-3xl font-bold text-slate-900">{user?._count.favorites ?? 0}</p>
            </Card>
            <Card className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold text-slate-500">Note moyenne donnée</p>
              <p className="text-3xl font-bold text-slate-900">4.3</p>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-3" id="reviews">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Mes avis récents</h2>
                <Badge variant="muted">{reviews.length} avis</Badge>
              </div>
              <div className="space-y-3">
                {reviews.map((review) => (
                  <Card
                    key={review.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{review.business.name}</p>
                        <p className="text-xs text-slate-500">
                          {review.business.category?.name ?? "Etablissement"} ·{" "}
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Stars value={review.rating} />
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{review.comment}</p>
                    <div className="mt-3 flex gap-3 text-xs font-semibold text-primary">
                      <Link href={`/review/${review.id}/edit`}>Modifier</Link>
                      <Link href={`/review/${review.id}/delete`} className="text-rose-600">
                        Supprimer
                      </Link>
                    </div>
                  </Card>
                ))}
                {reviews.length === 0 && (
                  <p className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-600">
                    Aucun avis pour l’instant.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3" id="favorites">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Mes favoris</h2>
                <Badge variant="muted">{favorites.length}</Badge>
              </div>
              <div className="space-y-3">
                {favorites.map((fav) => (
                  <Card
                    key={fav.businessId}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <Link
                      href={`/business/${fav.businessId}`}
                      className="text-sm font-semibold text-slate-900 hover:text-primary"
                    >
                      {fav.business.name}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {fav.business.category?.name ?? "Catégorie"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Stars value={(fav.business as any).rating ?? 4} />
                      <span>{fav.business._count?.reviews ?? 0} avis</span>
                    </div>
                  </Card>
                ))}
                {favorites.length === 0 && (
                  <p className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-600">
                    Aucun favori pour le moment.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
