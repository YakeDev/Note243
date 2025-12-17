"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageShell, SectionHeader } from "@/components/layouts/Shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
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
import { Skeleton } from "@/components/ui/skeleton";

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
  BanknotesIcon: WalletIcon,
  WalletIcon,
};

const nameFallback: Record<string, React.ComponentType<{ className?: string }>> = {
  "Hébergement & Loisirs": HomeModernIcon,
  "Restauration & Alimentation": BuildingStorefrontIcon,
  "Santé & Bien-être": HeartIcon,
  "Construction & Immobilier": BuildingOffice2Icon,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        const json = await res.json().catch(() => ({}));
        setCategories(json.data ?? []);
      } catch {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.children?.some((child) => child.name.toLowerCase().includes(q)),
    );
  }, [categories, search]);

  return (
    <PageShell className="space-y-8 py-12" width="xl">
      <SectionHeader
        title="Que cherchez-vous ?"
        description="Explorez les entreprises par catégorie. Les résultats sont issus de la base de données."
        actions={
          <form
            action="/explorer"
            method="get"
            className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-slate-300 sm:flex"
          >
            <MagnifyingGlassIcon className="h-4 w-4 text-slate-500" />
            <input
              type="text"
              name="search"
              placeholder="Aller sur la page Explorer..."
              className="w-40 border-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
            />
            <Button type="submit" size="sm" variant="ghost">
              Explorer
            </Button>
          </form>
        }
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <SparklesIcon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Recherche ciblée</p>
              <p className="text-xs text-slate-600">
                Filtrer rapidement les catégories et sous-catégories.
              </p>
            </div>
          </div>
          <div className="w-full max-w-md">
            <Input
              name="q"
              placeholder="Rechercher une catégorie ou sous-catégorie"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Rechercher une catégorie"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <Skeleton key={idx} className="h-32 rounded-2xl border border-slate-200" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
          Aucune catégorie trouvée pour cette recherche.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((cat, idx) => {
            const palette = palettes[idx % palettes.length];
            const Icon = (cat.icon && iconMap[cat.icon]) || nameFallback[cat.name] || undefined;
            return (
              <Card
                key={cat.id}
                className={`h-full rounded-2xl border ${palette.border} ${palette.bg} p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md`}
              >
                <Link
                  href={`/categories/${cat.slug}`}
                  className="flex w-full items-center gap-2 text-left"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 text-sm font-semibold text-primary shadow">
                    {Icon ? <Icon className="h-5 w-5" aria-hidden="true" /> : cat.name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900">{cat.name}</span>
                    <Badge variant="muted">
                      {(cat.children ?? []).length} sous-catégorie
                      {(cat.children ?? []).length > 1 ? "s" : ""}
                    </Badge>
                  </div>
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
              </Card>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
