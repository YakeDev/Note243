"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { loginSchema } from "@/lib/validators/auth";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

   // Affiche un message après vérification email
   useEffect(() => {
     const verified = searchParams.get("verified");
     if (verified === "1") {
       setInfo("Votre email est vérifié. Vous pouvez vous connecter.");
     } else if (verified === "0") {
       setErrors({ form: "Lien de vérification invalide ou expiré. Demandez un nouvel envoi." });
     }
   }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setInfo(null);

    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
      callbackUrl,
    });
    setLoading(false);

    if (res?.error) {
      const msg =
        res.error.includes("confirmer votre email")
          ? "Veuillez confirmer votre email avant de vous connecter."
          : "Identifiants invalides ou compte inexistant.";
      setErrors({ form: msg });
      return;
    }

    try {
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const role = session?.user?.role;
      if (role === "ADMIN") router.push("/admin");
      else if (role === "OWNER") router.push("/dashboard/owner");
      else router.push("/explorer");
    } catch {
      router.push(callbackUrl || "/explorer");
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-12">
      <div className="w-full rounded-2xl bg-white p-8 shadow-card">
        <div className="flex flex-col gap-2 border-b border-slate-200 pb-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Note243</p>
          <h1 className="text-3xl font-bold text-slate-900">Heureux de vous revoir</h1>
          <p className="text-sm text-slate-600">Connectez-vous pour continuer.</p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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

          {errors.form && <p className="text-sm text-rose-600">{errors.form}</p>}
          {info && <p className="text-sm text-emerald-700">{info}</p>}

          <div className="flex items-center justify-between text-sm">
            <Link href="/auth/forgot-password" className="font-semibold text-primary hover:underline">
              Mot de passe oublié ?
            </Link>
            <Link href="/auth/register" className="font-semibold text-primary hover:underline">
              Pas encore de compte ? Créer un compte
            </Link>
          </div>

          <Button type="submit" loading={loading} className="w-full justify-center">
            Se connecter
          </Button>
        </form>
      </div>
    </div>
  );
}
