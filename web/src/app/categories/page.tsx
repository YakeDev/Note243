"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  MagnifyingGlassIcon,
  SparklesIcon,
  ClipboardDocumentCheckIcon,
  TagIcon,
  TruckIcon,
  BuildingStorefrontIcon,
  BuildingOffice2Icon,
  BuildingOfficeIcon,
  HeartIcon,
  WrenchScrewdriverIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  CubeIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  StarIcon,
  GiftIcon,
  MusicalNoteIcon,
  LifebuoyIcon,
  LightBulbIcon,
  CameraIcon,
  MegaphoneIcon,
  ChartPieIcon,
  DevicePhoneMobileIcon,
  CodeBracketIcon,
  ComputerDesktopIcon,
  CommandLineIcon,
  BookOpenIcon,
  GlobeAltIcon,
  BanknotesIcon,
  HomeModernIcon,
  WalletIcon,
} from "@/components/icons";

type Category = {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  children?: { id: string; name: string; slug: string }[];
};

const palettes = [
  { bg: "bg-amber-50", border: "border-amber-100" },
  { bg: "bg-rose-50", border: "border-rose-100" },
  { bg: "bg-orange-50", border: "border-orange-100" },
  { bg: "bg-emerald-50", border: "border-emerald-100" },
  { bg: "bg-sky-50", border: "border-sky-100" },
  { bg: "bg-lime-50", border: "border-lime-100" },
  { bg: "bg-fuchsia-50", border: "border-fuchsia-100" },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  SparklesIcon,
  ClipboardDocumentCheckIcon,
  TagIcon,
  TruckIcon,
  BuildingStorefrontIcon,
  BuildingOffice2Icon,
  BuildingOfficeIcon,
  HeartIcon,
  WrenchScrewdriverIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  CubeIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  StarIcon,
  GiftIcon,
  HomeModernIcon,
  MusicalNoteIcon,
  LifebuoyIcon,
  LightBulbIcon,
  CameraIcon,
  MegaphoneIcon,
  ChartPieIcon,
  DevicePhoneMobileIcon,
  CodeBracketIcon,
  ComputerDesktopIcon,
  CommandLineIcon,
  BookOpenIcon,
  GlobeAltIcon,
  BanknotesIcon: WalletIcon, // fallback to wallet
  WalletIcon,
};

// Icônes par défaut basées sur le nom (si la colonne icon est vide ou inconnue)
const nameFallback: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  "Hébergement & Loisirs": HomeModernIcon,
  "Restauration & Alimentation": BuildingStorefrontIcon,
  "Santé & Bien-être": HeartIcon,
  "Construction & Immobilier": BuildingOffice2Icon,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        const json = await res.json().catch(() => ({}));
        setCategories(json.data ?? []);
      } catch {
        setCategories([]);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.children?.some((child) => child.name.toLowerCase().includes(q)),
    );
  }, [categories, search]);

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 py-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Que cherchez-vous ?
          </h1>
          <form
            action="/explorer"
            method="get"
            className="flex w-full max-w-xl items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-md transition hover:border-slate-300 focus-within:border-slate-400"
          >
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-500" />
            <input
              type="text"
              name="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une catégorie ou sous-catégorie"
              className="w-full border-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
            />
          </form>
          {/* <p className="text-xs text-slate-500">
            La recherche ouvre la page résultats (/explorer) sans modifier cette
            page.
          </p> */}
        </div>

        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Explorez les entreprises par catégorie
          </h2>

          {filtered.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
              Aucune catégorie trouvée pour cette recherche.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((cat, idx) => {
                const palette = palettes[idx % palettes.length];
                const Icon =
                  (cat.icon && iconMap[cat.icon]) ||
                  nameFallback[cat.name] ||
                  undefined;
                return (
                  <div
                    key={cat.id}
                    className={`rounded-2xl border ${palette.border} ${palette.bg} p-4 shadow-sm`}
                  >
                    <Link
                      href={`/categories/${cat.slug}`}
                      className="flex w-full items-center gap-2 text-left"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/70 text-sm font-semibold text-primary shadow">
                        {Icon ? (
                          <Icon className="h-5 w-5" />
                        ) : (
                          cat.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="text-sm font-semibold text-slate-900">
                        {cat.name}
                      </span>
                    </Link>
                    <div className="mt-3 space-y-1">
                      {(cat.children ?? []).map((child) => (
                        <Link
                          key={child.id}
                          href={`/categories/${child.slug}`}
                          className="block w-full rounded-lg px-2 py-1 text-left text-sm text-slate-700 transition hover:bg-white/70 hover:text-primary"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
