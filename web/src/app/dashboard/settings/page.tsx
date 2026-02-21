import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layouts/Shell";
import { UserSidebar } from "@/components/dashboard/UserSidebar";
import { SettingsContent } from "@/components/SettingsContent";

export default async function DashboardSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/dashboard/settings");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true },
  });

  return (
    <DashboardShell
      title="Parametres du compte"
      description="Mettez a jour vos informations personnelles."
      width="xl"
    >
      <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
        <UserSidebar />
        <SettingsContent user={user ?? session.user} />
      </div>
    </DashboardShell>
  );
}
