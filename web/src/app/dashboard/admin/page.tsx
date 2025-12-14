import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PromoteUserForm from "./promote-user-form";

async function getStats() {
  const [businesses, reviews, reportsPending, claimsPending, users] = await Promise.all([
    prisma.business.count(),
    prisma.review.count(),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.claim.count({ where: { status: "PENDING" } }),
    prisma.user.count(),
  ]);
  return { businesses, reviews, reportsPending, claimsPending, users };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: "Établissements", value: stats.businesses, href: "/dashboard/admin/businesses" },
    { label: "Avis", value: stats.reviews, href: "/dashboard/admin/reviews" },
    { label: "Signalements en attente", value: stats.reportsPending, href: "/dashboard/admin/reports" },
    { label: "Revendications", value: stats.claimsPending, href: "/dashboard/admin/claims" },
    { label: "Utilisateurs", value: stats.users, href: "/dashboard/admin/users" },
  ];

  const quickLinks = [
    { href: "/dashboard/admin/businesses", label: "Gérer les établissements" },
    { href: "/dashboard/admin/reviews", label: "Modérer les avis" },
    { href: "/dashboard/admin/reports", label: "Traiter les signalements" },
    { href: "/dashboard/admin/claims", label: "Valider les revendications" },
    { href: "/dashboard/admin/suggestions", label: "Suggestions d’établissements" },
    { href: "/dashboard/admin/categories", label: "Catégories" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Note243 Admin</p>
        <h1 className="text-3xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-sm text-slate-600">
          Vue synthétique de l’activité : établissements, avis, signalements et utilisateurs.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm font-semibold text-slate-600">{card.label}</p>
            <p className="text-3xl font-bold text-slate-900">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Accès rapide</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-primary hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Promouvoir un utilisateur</h2>
        <p className="text-sm text-slate-600">
          Basculer un compte en ADMIN ou OWNER et marquer l’email comme vérifié si nécessaire.
        </p>
        <div className="mt-4">
          <PromoteUserForm />
        </div>
      </div>
    </div>
  );
}
