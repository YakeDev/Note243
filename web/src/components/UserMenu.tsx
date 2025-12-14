"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";

type User = Session["user"];

const roleDashboard = (role?: string | null) =>
  role === "ADMIN" ? "/dashboard/admin" : role === "OWNER" ? "/dashboard/owner" : "/dashboard";

export function UserMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials =
    (user?.name?.trim()?.charAt(0) ?? user?.email?.trim()?.charAt(0) ?? "?").toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 shadow-sm hover:border-primary"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
          {initials}
        </span>
        <span className="hidden sm:block max-w-[140px] truncate">{user?.name ?? user?.email}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
          <div className="px-3 py-2 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">{user?.name ?? "Utilisateur"}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
          <div className="my-1 h-px bg-slate-200" />
          <MenuLink href={roleDashboard(user?.role)} label="Tableau de bord" />
          <MenuLink href="/profile" label="Profil" />
          <MenuLink href="/settings" label="Paramètres" />
          <MenuLink href="/help" label="Aide" />
          <div className="my-1 h-px bg-slate-200" />
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50"
          >
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}

function MenuLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-primary/5"
    >
      {label}
    </Link>
  );
}
