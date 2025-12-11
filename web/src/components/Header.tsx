import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold text-primary">
          Note243
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-700">
          <Link href="/explorer" className="hover:text-primary">
            Explorer
          </Link>
          <Link href="/categories" className="hover:text-primary">
            Catégories
          </Link>
          <Link href="/review/new" className="hidden sm:inline-flex hover:text-primary">
            Écrire un avis
          </Link>
        </nav>
        <Link
          href="/auth"
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
        >
          Connexion
        </Link>
      </div>
    </header>
  );
}
