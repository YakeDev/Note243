"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function UploadBusinessImages({ businessId }: { businessId: string }) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  async function upload(makeCover = false) {
    if (!files || files.length === 0) return;
    setLoading(true);

    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    fd.set("makeCover", makeCover ? "true" : "false");

    const res = await fetch(`/api/businesses/${businessId}/images`, { method: "POST", body: fd });
    setLoading(false);

    if (!res.ok) alert("Upload échoué");
    else window.location.reload();
  }

  return (
    <div className="space-y-3">
      <Input type="file" multiple accept="image/*" onChange={(e) => setFiles(e.target.files)} />
      <div className="flex gap-2">
        <Button onClick={() => upload(false)} disabled={loading}>
          {loading ? "Upload..." : "Ajouter"}
        </Button>
        <Button variant="secondary" onClick={() => upload(true)} disabled={loading}>
          Définir comme cover
        </Button>
      </div>
    </div>
  );
}
