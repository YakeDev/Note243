"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPasswordSchema } from "@/lib/validators/auth";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setInfo(null);

    const parsed = resetPasswordSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: form.password, confirm: form.confirm }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setErrors({ form: data?.message ?? "Token invalide ou expiré" });
      return;
    }

    setInfo("Mot de passe mis à jour. Vous pouvez vous connecter.");
    setTimeout(() => router.push("/auth/login"), 800);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-12">
      <div className="w-full rounded-2xl bg-white p-8 shadow-card">
        <div className="flex flex-col gap-2 border-b border-slate-200 pb-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Note243</p>
          <h1 className="text-3xl font-bold text-slate-900">Réinitialiser votre mot de passe</h1>
          <p className="text-sm text-slate-600">Choisissez un nouveau mot de passe.</p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <PasswordInput
            label="Nouveau mot de passe"
            id="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
          />
          <PasswordInput
            label="Confirmation du mot de passe"
            id="confirm"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            error={errors.confirm}
          />
          {errors.form && <p className="text-sm text-rose-600">{errors.form}</p>}
          {info && <p className="text-sm text-emerald-700">{info}</p>}

          <Button type="submit" loading={loading} className="w-full justify-center">
            Réinitialiser mon mot de passe
          </Button>
        </form>
      </div>
    </div>
  );
}
