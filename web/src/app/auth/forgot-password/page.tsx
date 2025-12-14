"use client";

import { useState } from "react";
import { resetRequestSchema } from "@/lib/validators/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const parsed = resetRequestSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Email invalide");
      return;
    }

    setLoading(true);
    await fetch("/api/auth/reset-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});
    setLoading(false);
    setInfo("Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.");
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-12">
      <div className="w-full rounded-2xl bg-white p-8 shadow-card">
        <div className="flex flex-col gap-2 border-b border-slate-200 pb-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Note243</p>
          <h1 className="text-3xl font-bold text-slate-900">Mot de passe oublié</h1>
          <p className="text-sm text-slate-600">Entrez votre email. Nous enverrons un lien.</p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Email"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error ?? undefined}
          />

          {info && <p className="text-sm text-emerald-700">{info}</p>}

          <Button type="submit" loading={loading} className="w-full justify-center">
            Envoyer le lien de réinitialisation
          </Button>
        </form>
      </div>
    </div>
  );
}
