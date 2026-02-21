"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ClaimStatus = "PENDING" | "APPROVED" | "REJECTED" | null | undefined;

type Props = {
  businessId: string;
  businessName?: string | null;
  initialStatus?: ClaimStatus;
};

export function ClaimBusinessDialog({ businessId, businessName, initialStatus }: Props) {
  const [status, setStatus] = useState<ClaimStatus>(initialStatus ?? null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "PENDING") {
    return (
      <Button variant="secondary" disabled className="w-full">
        Revendication en attente
      </Button>
    );
  }

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("businessId", businessId);
      fd.set("message", message.trim());
      fd.set("proofUrl", proofUrl.trim());
      fd.set("notes", notes.trim());
      if (proofFile) fd.set("proofFile", proofFile);

      const res = await fetch("/api/claims", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error || "Impossible d'envoyer la revendication.");
      }

      setStatus("PENDING");
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          Revendiquer {businessName ? `« ${businessName} »` : "cet établissement"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
        <DialogTitle>Revendication de fiche</DialogTitle>
        <DialogDescription>
          Expliquez votre lien avec l&apos;etablissement et ajoutez une preuve si possible.
        </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Textarea
            placeholder="Message au moderateur (facultatif)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Input
            label="Lien de preuve (site, registre, document)"
            placeholder="https://..."
            value={proofUrl}
            onChange={(e) => setProofUrl(e.target.value)}
          />
          <Input
            label="Fichier de preuve (PDF, image)"
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
          />
          <Textarea
            placeholder="Notes internes (facultatif)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={submit} loading={loading}>
            Envoyer la demande
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
