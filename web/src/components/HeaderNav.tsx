"use client";

import { useState } from "react";
import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@/components/icons";
import { UserMenu } from "@/components/UserMenu";
import { cn } from "@/lib/utils";

type HeaderUser = { name?: string | null; email?: string | null; role?: string | null };

const navLinks = [
  { href: "/explorer", label: "Explorer" },
  { href: "/categories", label: "Catégories" },
  { href: "/review/new", label: "Écrire un avis" },
];

export function HeaderNav({ user }: { user?: HeaderUser }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-3">
      {/* Desktop */}
      <nav className="hidden items-center gap-4 text-sm font-medium text-slate-700 md:flex">
        {navLinks.map((item) => (
          <Link key={item.href} href={item.href} className="hover:text-primary">
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Desktop user/auth */}
      <div className="hidden md:block">
        {user ? (
          <UserMenu user={user as any} />
        ) : (
          <Link
            href="/auth/login"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            Connexion
          </Link>
        )}
      </div>

      {/* Mobile burger */}
      <div className="md:hidden">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-sm hover:border-primary"
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
        </button>
        {open && (
          <div className="absolute right-4 top-14 z-30 w-56 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
            <nav className="flex flex-col gap-2 text-sm font-semibold text-slate-800">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2 hover:bg-primary/5"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="my-2 h-px bg-slate-200" />
            {user ? (
              <UserMenu user={user as any} />
            ) : (
              <Link
                href="/auth/login"
                className={cn(
                  "mt-1 flex w-full items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover",
                )}
                onClick={() => setOpen(false)}
              >
                Connexion
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

