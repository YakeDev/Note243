"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Card, CardContent } from "@/components/ui/card";

type UserInfo = {
  name?: string | null;
  email?: string | null;
  role?: string | null;
};

export function SettingsContent({ user }: { user: UserInfo }) {
  const [pendingProfile, startProfile] = useTransition();
  const [pendingPassword, startPassword] = useTransition();

  const [profile, setProfile] = useState({
    name: user.name ?? "",
    email: user.email ?? "",
  });
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileErr, setProfileErr] = useState<string | null>(null);

  const [pwd, setPwd] = useState({ current: "", password: "", confirm: "" });
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);
  const [pwdErr, setPwdErr] = useState<string | null>(null);

  const updateProfile = () => {
    startProfile(async () => {
      setProfileMsg(null);
      setProfileErr(null);
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name.trim(),
          email: profile.email.trim(),
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setProfileErr(payload?.error || "Impossible de mettre a jour le profil.");
        return;
      }
      setProfileMsg(payload?.warning || "Profil mis a jour.");
    });
  };

  const updatePassword = () => {
    startPassword(async () => {
      setPwdMsg(null);
      setPwdErr(null);
      const res = await fetch("/api/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: pwd.current,
          password: pwd.password,
          confirm: pwd.confirm,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPwdErr(payload?.error || payload?.message || "Impossible de changer le mot de passe.");
        return;
      }
      setPwd({ current: "", password: "", confirm: "" });
      setPwdMsg("Mot de passe mis a jour.");
    });
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <CardContent className="space-y-4 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Informations du compte</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nom"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </div>
          <p className="text-xs text-slate-500">
            Si vous changez l&apos;email, une nouvelle verification peut etre requise.
          </p>
          <div className="flex items-center gap-2">
            <Button onClick={updateProfile} loading={pendingProfile}>
              Enregistrer
            </Button>
            {profileMsg ? <p className="text-xs text-emerald-600">{profileMsg}</p> : null}
            {profileErr ? <p className="text-xs text-rose-600">{profileErr}</p> : null}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <CardContent className="space-y-4 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Mot de passe</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <PasswordInput
              label="Mot de passe actuel"
              value={pwd.current}
              onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
              autoComplete="current-password"
            />
            <div className="hidden sm:block" />
            <PasswordInput
              label="Nouveau mot de passe"
              value={pwd.password}
              onChange={(e) => setPwd({ ...pwd, password: e.target.value })}
              autoComplete="new-password"
            />
            <PasswordInput
              label="Confirmation"
              value={pwd.confirm}
              onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
              autoComplete="new-password"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={updatePassword} loading={pendingPassword}>
              Mettre a jour
            </Button>
            {pwdMsg ? <p className="text-xs text-emerald-600">{pwdMsg}</p> : null}
            {pwdErr ? <p className="text-xs text-rose-600">{pwdErr}</p> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
