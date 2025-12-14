export function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="text-xl font-semibold">Note243</p>
            <p className="mt-2 text-sm text-white/80">
              Plateforme d&apos;avis clients pour les établissements de Lubumbashi.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <p className="font-semibold">Découvrir</p>
              <a href="/review/new" className="block text-white/80 hover:text-white">
                Écrire un avis
              </a>
              <a href="/explorer" className="block text-white/80 hover:text-white">
                Explorer
              </a>
              <a href="/categories" className="block text-white/80 hover:text-white">
                Catégories
              </a>
            </div>
            <div className="space-y-2">
              <p className="font-semibold">Support</p>
              <a href="/auth" className="block text-white/80 hover:text-white">
                Connexion
              </a>
              <a href="/contact" className="block text-white/80 hover:text-white">
                Centre d&apos;aide
              </a>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <p className="font-semibold">Restez informé</p>
            <div className="flex items-center gap-2 rounded-full bg-white/10 p-2">
              <input
                type="email"
                placeholder="Votre email"
                className="w-full rounded-full bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/60 focus:outline-none"
              />
              <button className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-primary transition hover:bg-slate-100">
                Souscrire
              </button>
            </div>
            <p className="text-xs text-white/70">© 2025 Note243 A/S. Tous droits réservés.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
