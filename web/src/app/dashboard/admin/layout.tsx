import type { ReactNode } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login?next=/dashboard/admin");
  if (session.user.role !== "ADMIN") redirect("/?error=forbidden");

  return <div className="min-h-screen bg-slate-50">{children}</div>;
}
