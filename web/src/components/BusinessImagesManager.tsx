"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

type ImageItem = {
  id: string;
  url: string;
  isCover: boolean;
};

type Props = {
  businessId: string;
  initialImages: ImageItem[];
};

export function BusinessImagesManager({ businessId, initialImages }: Props) {
  const [images, setImages] = useState<ImageItem[]>(initialImages);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    const res = await fetch(`/api/businesses/${businessId}/images`);
    if (!res.ok) return;
    const data = await res.json();
    setImages(data.images ?? []);
  };

  const setCover = async (imageId: string) => {
    setBusyId(imageId);
    setError(null);
    try {
      const res = await fetch(`/api/businesses/${businessId}/images/${imageId}/cover`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Impossible de definir cette image en cover.");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setBusyId(null);
    }
  };

  const removeImage = async (imageId: string) => {
    if (!window.confirm("Supprimer cette image ?")) return;
    setBusyId(imageId);
    setError(null);
    try {
      const res = await fetch(`/api/businesses/${businessId}/images/${imageId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Impossible de supprimer l'image.");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {images.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-600">
          Aucune image pour cet etablissement.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img) => (
            <div
              key={img.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="relative aspect-[4/3] bg-slate-100">
                <img src={img.url} alt="" className="h-full w-full object-cover" />
                {img.isCover ? (
                  <span className="absolute left-3 top-3 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white">
                    Cover
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2 p-3">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setCover(img.id)}
                  disabled={img.isCover || busyId === img.id}
                >
                  {img.isCover ? "Cover active" : "Definir comme cover"}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeImage(img.id)}
                  disabled={busyId === img.id}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
