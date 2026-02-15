"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { loginSchema } from "@/lib/validators/auth";
import { AuthShell } from "@/components/layouts/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const callbackParam = searchParams.get("callbackUrl");
  const callbackUrl = nextParam || callbackParam || "/";
  const safeCallbackUrl = callbackUrl.startsWith("/auth/login") ? "/" : callbackUrl;

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();

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
      router.replace("/admin");
      return;
    }
    if (role === "OWNER") {
      router.replace("/dashboard/owner");
      return;
    }
    if (role) {
      router.replace("/explorer");
      return;
    }
    router.replace(safeCallbackUrl || "/explorer");
  }, [router, safeCallbackUrl, session, status]);

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
      router.refresh(); // force revalidation of server components (Header/menu)
      const sessionRes = await fetch("/api/auth/session", { cache: "no-store" });
      const session = await sessionRes.json();
      const role = session?.user?.role;
      if (role === "ADMIN") {
        router.push("/admin");
        return;
      }
      if (role === "OWNER") {
        router.push("/dashboard/owner");
        return;
      }
      if (role) {
        router.push("/explorer");
        return;
      }
      // Pas de session retournée : on force une navigation plein page avec le callbackUrl
      window.location.assign(safeCallbackUrl || "/explorer");
    } catch {
      window.location.assign(safeCallbackUrl || "/explorer");
    }
  };

  return (
    <AuthShell
      badge="Note243"
      title="Heureux de vous revoir"
      subtitle="Connectez-vous pour continuer."
      footer={
        <div className="flex flex-col gap-2 text-sm">
          <Link href="/auth/forgot-password" className="font-semibold text-primary hover:underline">
            Mot de passe oublié ?
          </Link>
          <Link href="/auth/register" className="font-semibold text-primary hover:underline">
            Pas encore de compte ? Créer un compte
          </Link>
        </div>
      }
    >
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
    </AuthShell>
  );
}
