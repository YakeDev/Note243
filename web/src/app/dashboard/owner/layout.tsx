import type { ReactNode } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OwnerLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/dashboard/owner");
  }
  if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
    redirect("/");
  }

  return <div className="min-h-screen bg-slate-50">{children}</div>;
}
