"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerSchema } from "@/lib/validators/auth";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";

type AccountType = "USER" | "OWNER";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    accountType: "USER" as AccountType,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [info, setInfo] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setInfo(null);
    setWarning(null);

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error || data?.message || "Impossible de créer le compte.";
        throw new Error(msg);
      }

      if (data?.warning) setWarning(data.warning);
      setInfo("Compte créé. Vérifiez vos emails pour confirmer votre compte.");
      setTimeout(() => router.push("/auth/login"), 4000);
    } catch (err: any) {
      setInfo(null);
      setWarning(null);
      setErrors({ form: err.message ?? "Erreur inconnue" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-12">
      <div className="w-full rounded-2xl bg-white p-8 shadow-card">
        <div className="flex flex-col gap-2 border-b border-slate-200 pb-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Note243</p>
          <h1 className="text-3xl font-bold text-slate-900">Créer un compte</h1>
          <p className="text-sm text-slate-600">Créez votre compte en quelques secondes.</p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Nom complet"
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
          />
          <Input
            label="Email"
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
          />
          <PasswordInput
            label="Mot de passe"
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

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-800">Type de compte</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 ${
                  form.accountType === "USER" ? "border-primary bg-primary/5" : "border-slate-200"
                }`}
              >
                <input
                  type="radio"
                  name="accountType"
                  value="USER"
                  checked={form.accountType === "USER"}
                  onChange={() => setForm({ ...form, accountType: "USER" })}
                  className="mt-1"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Je suis un utilisateur</p>
                  <p className="text-xs text-slate-600">Je veux laisser des avis et explorer.</p>
                </div>
              </label>
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 ${
                  form.accountType === "OWNER" ? "border-primary bg-primary/5" : "border-slate-200"
                }`}
              >
                <input
                  type="radio"
                  name="accountType"
                  value="OWNER"
                  checked={form.accountType === "OWNER"}
                  onChange={() => setForm({ ...form, accountType: "OWNER" })}
                  className="mt-1"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Je suis un propriétaire</p>
                  <p className="text-xs text-slate-600">Je veux gérer la fiche de mon établissement.</p>
                </div>
              </label>
            </div>
          </div>

          {errors.form && <p className="text-sm text-rose-600">{errors.form}</p>}
          {info && <p className="text-sm text-emerald-700">{info}</p>}
          {warning && <p className="text-sm text-amber-600">{warning}</p>}

          <Button type="submit" loading={loading} className="w-full justify-center">
            Créer mon compte
          </Button>

          <p className="text-sm text-slate-600">
            Déjà un compte ?{" "}
            <a href="/auth/login" className="font-semibold text-primary hover:underline">
              Se connecter
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
