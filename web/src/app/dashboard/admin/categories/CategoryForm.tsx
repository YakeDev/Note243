"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/slugify";
import { categoryCreateSchema, categoryUpdateSchema } from "@/lib/validators/category";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Option = { id: string; name: string };

type CategoryFormProps = {
  mode: "create" | "edit";
  initialSlug?: string;
  initialData?: {
    name: string;
    slug: string;
    description?: string | null;
    icon?: string | null;
    parentId?: string | null;
  };
  parentOptions: Option[];
};

export function CategoryForm({ mode, initialData, initialSlug, parentOptions }: CategoryFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [icon, setIcon] = useState(initialData?.icon ?? "");
  const [parentId, setParentId] = useState(initialData?.parentId ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState<boolean>(!!initialData);

  useEffect(() => {
    if (!slugManuallyEdited) {
      setSlug(slugify(name));
    }
  }, [name, slugManuallyEdited]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const payload = {
      name,
      slug,
      description,
      icon,
      parentId: parentId || undefined,
    };

    const schema = mode === "create" ? categoryCreateSchema : categoryUpdateSchema;
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      setLoading(false);
      setError("Veuillez vérifier les champs obligatoires.");
      return;
    }

    const endpoint =
      mode === "create"
        ? "/api/categories"
        : `/api/categories/${encodeURIComponent(initialSlug || slug)}`;

    const res = await fetch(endpoint, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    setLoading(false);

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.message || "Impossible d'enregistrer la catégorie.");
      return;
    }

    setSuccess(
      mode === "create"
        ? "Catégorie créée avec succès."
        : "Catégorie mise à jour avec succès.",
    );
    router.push("/dashboard/admin/categories");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="name">
          Nom de la catégorie *
        </label>
        <Input
          id="name"
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Restaurants"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="slug">
          Slug (URL) *
        </label>
        <Input
          id="slug"
          name="slug"
          required
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugManuallyEdited(true);
          }}
          placeholder="restaurants"
        />
        <p className="mt-1 text-xs text-slate-500">
          Utilisé dans l&apos;URL : /categories/{slug || "slug"}
        </p>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="parent">
          Catégorie parente (optionnel)
        </label>
        <select
          id="parent"
          name="parentId"
          value={parentId ?? ""}
          onChange={(e) => setParentId(e.target.value)}
          className="mt-1 w-full rounded-lg border-slate-200 text-sm focus:border-primary focus:ring-primary"
        >
          <option value="">Aucune (catégorie principale)</option>
          {parentOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="icon">
          Icône (optionnel)
        </label>
        <Input
          id="icon"
          name="icon"
          value={icon ?? ""}
          onChange={(e) => setIcon(e.target.value)}
          placeholder="Ex: tag, icon-resto, emoji"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={description ?? ""}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-lg border-slate-200 text-sm focus:border-primary focus:ring-primary"
          placeholder="Phrase courte pour présenter la catégorie."
        />
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}
      {success && <p className="text-sm text-emerald-700">{success}</p>}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Annuler
        </button>
        <Button type="submit" disabled={loading} loading={loading}>
          {loading ? "En cours..." : mode === "create" ? "Créer la catégorie" : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
