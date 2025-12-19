"use client";

import { useMemo, useState } from "react";
import { businessSchema } from "@/lib/validators/business";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type CategoryOption = { id: string; name: string; children?: { id: string; name: string }[] };

export function BusinessForm({ categories }: { categories: CategoryOption[] }) {
  const [parentCategoryId, setParentCategoryId] = useState(categories[0]?.id ?? "");
  const childOptions = useMemo(
    () => categories.find((cat) => cat.id === parentCategoryId)?.children ?? [],
    [categories, parentCategoryId],
  );

  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    city: "Lubumbashi",
    phone: "",
    website: "",
    categoryId: childOptions[0]?.id ?? categories[0]?.id ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const parsed = businessSchema.safeParse(form);
    if (!parsed.success) {
      setError("Vérifiez les champs obligatoires.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/business", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data?.message ?? "Impossible de créer l'établissement.");
      return;
    }

    setSuccess("Établissement créé.");
    setForm({
      name: "",
      description: "",
      address: "",
      city: "Lubumbashi",
      phone: "",
      website: "",
      categoryId: childOptions[0]?.id ?? categories[0]?.id ?? "",
    });
    setParentCategoryId(categories[0]?.id ?? "");
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <Input
        label="Nom"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-800">Catégorie parente</label>
          <select
            className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-primary focus:ring-primary"
            value={parentCategoryId}
            onChange={(e) => {
              const newParent = e.target.value;
              setParentCategoryId(newParent);
              const nextChildren =
                categories.find((cat) => cat.id === newParent)?.children ?? [];
              setForm((prev) => ({
                ...prev,
                categoryId: nextChildren[0]?.id ?? newParent,
              }));
            }}
            required
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-800">Sous-catégorie</label>
          <select
            className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-primary focus:ring-primary"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            required
          >
            {childOptions.length === 0 ? (
              <option value={parentCategoryId}>Aucune sous-catégorie (utiliser la parente)</option>
            ) : (
              childOptions.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      <Input
        label="Adresse"
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
      />
      <Input
        label="Ville"
        value={form.city}
        onChange={(e) => setForm({ ...form, city: e.target.value })}
      />
      <Input
        label="Téléphone"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />
      <Input
        label="Site web"
        value={form.website}
        onChange={(e) => setForm({ ...form, website: e.target.value })}
      />
      <div>
        <label className="text-sm font-medium text-slate-800">Description</label>
        <textarea
          className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-primary focus:ring-primary"
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}
      {success && <p className="text-sm text-emerald-700">{success}</p>}

      <Button type="submit" loading={loading} className="w-full justify-center">
        Créer l'établissement
      </Button>
    </form>
  );
}
