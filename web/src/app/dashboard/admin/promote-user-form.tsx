"use client";

import { useState } from "react";

export default function PromoteUserForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"USER" | "OWNER" | "ADMIN">("ADMIN");
  const [verifyEmail, setVerifyEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const res = await fetch("/api/admin/users/promote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role, verifyEmail }),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok) {
      setMsg(data?.error ?? "Erreur.");
      return;
    }

    setMsg(
      `OK: ${data.user.email} → role=${data.user.role}, emailVerified=${String(
        data.user.emailVerified
      )}`
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Email utilisateur</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ex: erickay.dev@gmail.com"
          className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          required
          type="email"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="sm:w-1/2">
          <label className="block text-sm font-medium">Rôle</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="USER">USER</option>
            <option value="OWNER">OWNER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        <label className="mt-2 flex items-center gap-2 text-sm sm:mt-6">
          <input
            type="checkbox"
            checked={verifyEmail}
            onChange={(e) => setVerifyEmail(e.target.checked)}
          />
          Marquer emailVerified = NOW()
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "Traitement..." : "Appliquer"}
      </button>

      {msg && <p className="text-sm text-gray-700">{msg}</p>}
    </form>
  );
}
