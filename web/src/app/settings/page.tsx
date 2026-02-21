import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageShell, SectionHeader } from "@/components/layouts/Shell";
import { SettingsContent } from "@/components/SettingsContent";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/settings");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true },
  });

  return (
    <PageShell className="space-y-6 py-12" width="xl">
      <SectionHeader
        title="Parametres"
        description="Gerez vos informations personnelles et votre mot de passe."
      />
      <SettingsContent user={user ?? session.user} />
    </PageShell>
  );
}
