"use client";
/* eslint-disable jsx-a11y/label-has-associated-control */

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  StarIcon,
  CheckCircleIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type BusinessOption = {
  id: string;
  name: string;
  category?: { name: string };
};

type CategoryOption = { id: string; name: string; children?: { id: string; name: string }[] };

const visitCategoryOptions = [
  "Repas",
  "Livraison",
  "Achat",
  "Consultation",
  "Rendez-vous",
  "Urgence",
  "Service client",
  "Reparation",
  "Installation",
  "Maintenance",
  "Formation",
  "Visite",
  "Sejour",
  "Location",
  "Demande de devis",
].map((label) => ({ value: label, label }));

function StarsInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1 text-amber-500">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button"
          key={n}
          onClick={() => onChange(n)}
          className="p-1 transition hover:scale-105 focus:outline-none"
          aria-label={`Note ${n}`}
        >
          <StarIcon
            className={`h-6 w-6 ${n <= value ? "fill-amber-400" : "fill-transparent stroke-amber-400"}`}
          />
        </button>
      ))}
    </div>
  );
}

function SuggestModal({
  open,
  onClose,
  categories,
  onSubmitted,
}: {
  open: boolean;
  onClose: () => void;
  categories: CategoryOption[];
  onSubmitted: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    subCategoryId: "",
    location: "",
    phone: "",
    website: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm({ name: "", categoryId: "", subCategoryId: "", location: "", phone: "", website: "" });
      setError(null);
    }
  }, [open]);

  const selectedCategory = categories.find((c) => c.id === form.categoryId);
  const subCategories = selectedCategory?.children ?? [];

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.categoryId) {
      setError("Nom et categorie obligatoires.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          categoryId: form.subCategoryId || form.categoryId,
          location: form.location || undefined,
          phone: form.phone || undefined,
          website: form.website || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Echec de l'envoi de la suggestion");
      onSubmitted();
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Proposer un établissement</h3>
            <p className="text-sm text-slate-600">
              Votre proposition sera vérifiée par un administrateur avant publication.
            </p>
          </div>
          <button
            type="button"
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
            onClick={onClose}
            aria-label="Fermer"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form className="mt-4 space-y-4" onSubmit={submit}>
          <div>
            <label className="text-sm font-semibold text-slate-800">Nom de l'établissement *</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-800">Catégorie *</label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value, subCategoryId: "" })}
              required
            >
              <option value="">Sélectionner</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          {subCategories.length > 0 && (
            <div>
              <label className="text-sm font-semibold text-slate-800">Sous-catégorie (optionnel)</label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={form.subCategoryId}
                onChange={(e) => setForm({ ...form, subCategoryId: e.target.value })}
              >
                <option value="">Aucune</option>
                {subCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-800">
                Localisation (ville, quartier)
              </label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-800">Téléphone</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-800">Site web</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
            />
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
            >
              {loading ? "Envoi..." : "Envoyer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const mockBusiness = {
  title: "Restaurant Le Gourmet",
  category: "Restaurant",
  rating: 4.6,
  reviews: 128,
  location: "Lubumbashi Centre",
  image:
    "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=900&q=80",
  certified: true,
};

export default function NewReviewPage() {
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("businessId") ?? undefined;
  const { data: session } = useSession();
  const router = useRouter();

  const [businesses, setBusinesses] = useState<BusinessOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [businessId, setBusinessId] = useState<string | undefined>(preselectedId);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [recommend, setRecommend] = useState(false);
  const [categoryVisit, setCategoryVisit] = useState(
    visitCategoryOptions[0]?.value ?? "",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [bizRes, catRes] = await Promise.all([
          fetch("/api/business?status=ACTIVE", { cache: "no-store" }),
          fetch("/api/categories", { cache: "no-store" }),
        ]);
        const bizJson = await bizRes.json().catch(() => ({}));
        const catJson = await catRes.json().catch(() => ({}));
        setBusinesses(bizJson.data ?? []);
        setCategories(catJson.data ?? []);
        if (!businessId && bizJson.data?.[0]?.id) setBusinessId(bizJson.data[0].id);
      } catch {
        // ignore
      }
    };
    load();
  }, [businessId]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return businesses.filter((b) => b.name.toLowerCase().includes(q)).slice(0, 8);
  }, [businesses, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, filtered.length]);

  const selected = useMemo(
    () => businesses.find((b) => b.id === businessId),
    [businesses, businessId],
  );

  const selectBusiness = (biz: BusinessOption) => {
    setBusinessId(biz.id);
    setQuery(biz.name);
    setShowResults(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!filtered.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const choice = filtered[activeIndex];
      if (choice) selectBusiness(choice);
    } else if (e.key === "Escape") {
      setShowResults(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!session?.user?.id) {
      setError("Connectez-vous pour publier un avis.");
      return;
    }
    if (!businessId) {
      setError("Choisissez un établissement ou proposez-en un.");
      return;
    }
    if (rating === 0) {
      setError("Choisissez une note.");
      return;
    }
    if (comment.trim().length < 10) {
      setError("Le commentaire doit faire au moins 10 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          comment,
          businessId,
          recommend,
          categoryVisit,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? "Erreur lors de l'enregistrement.");
      }
      setInfo("Avis publie avec succes.");
      router.push(`/business/${businessId}`);
    } catch (err: any) {
      setError(err.message ?? "Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900">
              Laisser un avis {selected ? `pour ${selected.name}` : ""}
            </h1>

            {!session && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Connectez-vous pour publier un avis.
                <button
                  onClick={() => signIn()}
                  className="ml-2 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white"
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  Se connecter
                </button>
              </div>
            )}

            <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800" htmlFor="business">
                  Établissement
                </label>
                <div className="relative">
                  <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                    <MagnifyingGlassIcon className="h-4 w-4" />
                    <input
                      id="business"
                      type="text"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setShowResults(true);
                      }}
                      onFocus={() => setShowResults(true)}
                      onKeyDown={handleKeyDown}
                      placeholder="Rechercher un établissement"
                      className="w-full border-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-0"
                      autoComplete="off"
                    />
                  </div>
                  {showResults && (
                    <div className="absolute left-0 right-0 z-20 mt-2 max-h-72 overflow-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                      {filtered.length === 0 ? (
                        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                          <span>Aucun résultat.</span>
                          <button
                            type="button"
                            className="text-primary underline"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setModalOpen(true)}
                          >
                            Proposer
                          </button>
                        </div>
                      ) : (
                        filtered.map((b, idx) => (
                          <button
                            type="button"
                            key={b.id}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => selectBusiness(b)}
                            className={cn(
                              "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm",
                              idx === activeIndex ? "bg-primary/10 text-primary" : "hover:bg-slate-50",
                            )}
                          >
                            <span>{b.name}</span>
                            {b.category?.name && (
                              <span className="text-xs text-slate-500">{b.category.name}</span>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <button
                      type="button"
                      className="text-xs font-semibold text-primary hover:underline"
                      onClick={() => setModalOpen(true)}
                    >
                      Proposer un établissement
                    </button>
                    {businessId && <span className="text-xs text-slate-500">ID: {businessId}</span>}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800">Votre note *</label>
                <StarsInput value={rating} onChange={setRating} />
                <p className="text-xs text-slate-500">Cliquez pour noter</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800" htmlFor="comment">
                  Votre commentaire
                </label>
                <textarea
                  id="comment"
                  rows={5}
                  placeholder="Partagez votre experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <div className="text-right text-xs text-slate-500">{comment.length} / 200</div>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-primary"
                  checked={recommend}
                  onChange={(e) => setRecommend(e.target.checked)}
                />
                Je recommande cet établissement
              </label>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800" htmlFor="categoryVisit">
                  Catégorie de visite
                </label>
                <div className="relative">
                  <Select value={categoryVisit} onValueChange={setCategoryVisit}>
                    <SelectTrigger
                      id="categoryVisit"
                      className="h-12 rounded-xl border-slate-200 px-3 py-3 text-sm text-slate-900 shadow-sm focus:ring-primary/20"
                    >
                      <SelectValue placeholder="S??lectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {visitCategoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {error && <p className="text-sm text-rose-600">{error}</p>}
              {info && <p className="text-sm text-emerald-700">{info}</p>}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Annuler
                </Link>
                <button
                  type="submit"
                  disabled={loading || !session}
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Publication..." : "Publier l'avis"}
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Si l'établissement n'existe pas, proposez-le : il sera validé par un administrateur avant
                d'apparaitre publiquement. Le proprietaire pourra ensuite le revendiquer.
              </p>
            </form>
          </section>

          <aside className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Établissement</p>
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-100">
              <img
                src={mockBusiness.image}
                alt={mockBusiness.title}
                className="h-32 w-full object-cover"
                loading="lazy"
              />
              <div className="space-y-2 p-4">
                <h3 className="text-base font-semibold text-slate-900">
                  {selected?.name ?? mockBusiness.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <StarIcon
                        key={n}
                        className={`h-4 w-4 ${
                          n <= Math.round(mockBusiness.rating)
                            ? "fill-amber-400"
                            : "fill-transparent stroke-amber-400"
                        }`}
                      />
                    ))}
                  </span>
                  <span className="font-semibold text-slate-900">{mockBusiness.rating.toFixed(1)}</span>
                  <span className="text-slate-500">({mockBusiness.reviews} avis)</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                    {selected?.category?.name ?? mockBusiness.category}
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
                    <CheckCircleIcon className="h-4 w-4" />
                    Certifié Note243
                  </span>
                </div>
                <p className="text-sm text-slate-600">{mockBusiness.location}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <SuggestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        categories={categories}
        onSubmitted={() =>
          setInfo("Suggestion envoyee. Elle sera validee par un administrateur avant d'etre visible.")
        }
      />
    </div>
  );
}
