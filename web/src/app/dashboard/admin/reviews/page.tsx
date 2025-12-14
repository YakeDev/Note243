import { prisma } from "@/lib/prisma";
import { ReviewActions } from "./ReviewActions";

export const dynamic = "force-dynamic";

async function getReviews() {
  return prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      business: { select: { id: true, name: true } },
      user: { select: { id: true, name: true, email: true } },
      _count: { select: { reports: true } },
    },
  });
}

export default async function AdminReviewsPage() {
  const reviews = await getReviews();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Avis</p>
        <h1 className="text-2xl font-bold text-slate-900">Modération des avis</h1>
        <p className="text-sm text-slate-600">
          Filtrez, masquez ou supprimez les avis non conformes. Les signalements sont prioritaires.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {review.user?.name ?? "Utilisateur"} ({review.user?.email ?? "?"})
                </p>
                <p className="text-xs text-slate-600">
                  Établissement : {review.business?.name ?? "?"}
                </p>
                <p className="text-xs text-slate-600">Note : {review.rating}/5</p>
                <p className="mt-2 text-sm text-slate-800">{review.comment}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Status : {review.status} · Signalements : {review._count?.reports ?? 0}
                </p>
              </div>
              <ReviewActions id={review.id} status={review.status} />
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
            Aucun avis à modérer.
          </p>
        )}
      </div>
    </div>
  );
}
