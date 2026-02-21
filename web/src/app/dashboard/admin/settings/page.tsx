import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SettingsContent } from "@/components/SettingsContent";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/dashboard/admin/settings");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/?error=forbidden");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Parametres</p>
        <h1 className="text-2xl font-bold text-slate-900">Parametres du compte</h1>
        <p className="text-sm text-slate-600">
          Mettez a jour vos informations personnelles et votre mot de passe.
        </p>
      </div>

      <SettingsContent user={user ?? session.user} />
    </div>
  );
}
