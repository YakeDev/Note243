"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";

interface Props {
  reviewId: string;
}

export function ReportButton({ reviewId }: Props) {
  const { status } = useSession();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const report = async () => {
    if (status !== "authenticated") {
      signIn();
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, reason: "Inapproprié", details: "" }),
      });
      if (!res.ok) throw new Error();
      setDone(true);
    } catch {
      // ignore for MVP
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={report}
      disabled={loading || done}
      className="text-xs font-semibold text-slate-500 hover:text-primary disabled:text-emerald-600"
    >
      {done ? "Signalé" : "Signaler"}
    </button>
  );
}
