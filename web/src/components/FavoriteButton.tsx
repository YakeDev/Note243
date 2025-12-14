"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";

interface Props {
  businessId: string;
}

export function FavoriteButton({ businessId }: Props) {
  const { status } = useSession();
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/favorite?businessId=${businessId}`, { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        setFavorited(Boolean(json.favorited));
      } catch {
        // ignore
      }
    };
    load();
  }, [businessId]);

  const toggle = async () => {
    if (status !== "authenticated") {
      signIn();
      return;
    }
    setLoading(true);
    try {
      if (favorited) {
        await fetch(`/api/favorite/${businessId}`, { method: "DELETE" });
        setFavorited(false);
      } else {
        const res = await fetch(`/api/favorite`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ businessId }),
        });
        if (!res.ok) throw new Error("Impossible de mettre en favori");
        setFavorited(true);
      }
    } catch {
      // ignore error UI minimal
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`flex h-10 w-10 items-center justify-center rounded-full border ${
        favorited ? "border-primary text-primary bg-primary/10" : "border-slate-200 text-slate-500"
      } hover:text-primary transition`}
      aria-label="Ajouter aux favoris"
    >
      ♥
    </button>
  );
}
