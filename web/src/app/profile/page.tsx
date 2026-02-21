import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageShell, SectionHeader } from "@/components/layouts/Shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const roleDashboard = (role?: string | null) =>
  role === "ADMIN" ? "/dashboard/admin" : role === "OWNER" ? "/dashboard/owner" : "/dashboard";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/profile");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, role: true },
  });

  const user = dbUser ?? session.user;

  return (
    <PageShell className="space-y-6 py-12" width="lg">
      <SectionHeader
        title="Profil"
        description="Consultez les informations de votre compte."
        actions={
          <Link
            href={roleDashboard(user.role)}
            className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            Tableau de bord
          </Link>
        }
      />

      <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <CardContent className="space-y-4 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nom</p>
            <p className="text-lg font-semibold text-slate-900">{user.name ?? "Utilisateur"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
            <p className="text-sm text-slate-700">{user.email ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</p>
            <Badge variant="outline">{user.role ?? "USER"}</Badge>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
