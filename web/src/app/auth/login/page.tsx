"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSession, signIn, useSession } from "next-auth/react";
import { loginSchema } from "@/lib/validators/auth";
import { AuthShell } from "@/components/layouts/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const callbackParam = searchParams.get("callbackUrl");
  const callbackUrl = nextParam || callbackParam || "/";
  const safeCallbackUrl = callbackUrl.startsWith("/auth/login") ? "/" : callbackUrl;
  const fallbackUrl = safeCallbackUrl || "/explorer";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const isRedirecting = status === "authenticated";

  useEffect(() => {
    const verified = searchParams.get("verified");
    if (verified === "1") {
      setInfo("Votre email est vérifié. Vous pouvez vous connecter.");
    } else if (verified === "0") {
      setErrors({
        form: "Lien de vérification invalide ou expiré. Demandez un nouvel envoi.",
      });
    }
  }, [searchParams]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const role = session?.user?.role;
    if (role === "ADMIN") {
      window.location.replace("/admin");
      return;
    }
    if (role === "OWNER") {
      window.location.replace("/dashboard/owner");
      return;
    }
    if (role) {
      window.location.replace("/explorer");
      return;
    }
    window.location.replace(fallbackUrl);
  }, [fallbackUrl, session, status]);

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
      redirectTo: safeCallbackUrl,
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
      const session = await getSession();
      const role = session?.user?.role;
      if (role === "ADMIN") {
        window.location.assign("/admin");
        return;
      }
      if (role === "OWNER") {
        window.location.assign("/dashboard/owner");
        return;
      }
      if (role) {
        window.location.assign("/explorer");
        return;
      }
      window.location.assign(fallbackUrl);
    } catch {
      window.location.assign(fallbackUrl);
    }
  };

  return (
    <AuthShell
      badge="Note243"
      title="Heureux de vous revoir"
      subtitle={isRedirecting ? "Redirection en cours..." : "Connectez-vous pour continuer."}
      footer={
        isRedirecting ? null : (
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/auth/forgot-password" className="font-semibold text-primary hover:underline">
              Mot de passe oublié ?
            </Link>
            <Link href="/auth/register" className="font-semibold text-primary hover:underline">
              Pas encore de compte ? Créer un compte
            </Link>
          </div>
        )
      }
    >
      {isRedirecting ? (
        <div className="space-y-3 text-sm text-slate-600">
          <p>Redirection vers votre espace...</p>
          <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-primary/70" />
          </div>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Email"
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
            autoComplete="email"
            required
          />
          <PasswordInput
            label="Mot de passe"
            id="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
            autoComplete="current-password"
            required
          />

          {errors.form && <p className="text-sm text-rose-600">{errors.form}</p>}
          {info && <p className="text-sm text-emerald-700">{info}</p>}

          <Button type="submit" loading={loading} className="w-full justify-center">
            Se connecter
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

