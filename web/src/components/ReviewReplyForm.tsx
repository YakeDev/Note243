"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  reviewId: string;
  initialReply?: string | null;
};

export function ReviewReplyForm({ reviewId, initialReply }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [reply, setReply] = useState(initialReply ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const save = (nextReply: string) => {
    startTransition(async () => {
      setError(null);
      setSuccess(null);
      const res = await fetch(`/api/review/${reviewId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: nextReply }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(payload?.message || "Impossible d'enregistrer la reponse.");
        return;
      }
      setSuccess(nextReply.trim().length > 0 ? "Reponse envoyee." : "Reponse supprimee.");
      router.refresh();
    });
  };

  useEffect(() => {
    setReply(initialReply ?? "");
  }, [initialReply]);

  return (
    <div className="mt-3 space-y-2">
      <Textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="Votre reponse..."
        className="min-h-[90px]"
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => save(reply)} disabled={pending}>
          {initialReply ? "Mettre a jour" : "Envoyer"}
        </Button>
        {initialReply ? (
          <Button size="sm" variant="secondary" onClick={() => save("")} disabled={pending}>
            Supprimer la reponse
          </Button>
        ) : null}
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {success ? <p className="text-xs text-emerald-600">{success}</p> : null}
    </div>
  );
}
