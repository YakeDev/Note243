import { redirect } from "next/navigation";
import { auth } from "@/auth";

type Role = "ADMIN" | "OWNER" | "USER" | null | undefined;

export default async function AdminEntryPage() {
  const session = await auth();
  const role: Role = session?.user?.role as Role;

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/admin");
  }

  if (role === "ADMIN") {
    redirect("/dashboard/admin");
  }

  if (role === "OWNER") {
    redirect("/dashboard/owner");
  }

  redirect("/dashboard");
}
