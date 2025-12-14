import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-12 sm:px-6 lg:px-8">
      <section className="rounded-2xl bg-white p-8 shadow-card">
        <div className="flex flex-col gap-4 text-center sm:text-left">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Note243 - Lubumbashi
          </p>
          <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            Trouver les meilleurs services à Lubumbashi
          </h1>
          <p className="text-lg text-slate-600">
            Plateforme locale d&apos;avis clients inspirée de Trustpilot et Google Reviews.
            Parcourez, explorez et partagez vos expériences.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/explorer"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              Explorer les établissements
            </Link>
            <Link
              href="/review/new"
              className="inline-flex items-center justify-center rounded-full border border-primary px-5 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10"
            >
              Écrire un avis
            </Link>
          </div>
        </div>
      </section>

      <section id="categories" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Catégories</h2>
          <Link className="text-sm font-medium text-primary hover:underline" href="/categories">
            Voir tout
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {["Restaurants", "Cliniques", "Boutiques", "Services", "Photocopies", "Hôtels"].map(
            (item) => (
              <div
                key={item}
                className="rounded-xl border border-slate-200 bg-white px-4 py-5 text-center text-sm font-medium text-slate-700 shadow-sm"
              >
                {item}
              </div>
            ),
          )}
        </div>
      </section>

      <section id="explorer" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Établissements populaires</h2>
          <Link className="text-sm font-medium text-primary hover:underline" href="/explorer">
            Voir plus
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((card) => (
            <article
              key={card}
              className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-card"
            >
              <div className="h-40 w-full rounded-t-xl bg-gradient-to-r from-primary/10 to-primary/5" />
              <div className="flex flex-1 flex-col gap-3 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Catégorie
                </p>
                <h3 className="text-lg font-semibold text-slate-900">Nom de l’établissement</h3>
                <p className="text-sm text-slate-600">
                  Placeholder description en attendant les données.
                </p>
                <div className="mt-auto">
                  <Link
                    href="/business/placeholder"
                    className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
                  >
                    Voir la fiche
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-primary/20 bg-primary/10 p-8 text-center sm:text-left">
        <h2 className="text-xl font-semibold text-slate-900">Vous êtes propriétaire ?</h2>
        <p className="mt-2 text-slate-700">
          Revendiquez votre fiche pour gérer vos informations et répondre aux avis.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/claim"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            Revendiquer ma fiche
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full border border-primary px-5 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10"
          >
            Nous contacter
          </Link>
        </div>
      </section>
    </div>
  );
}
