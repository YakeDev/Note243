import { redirect } from "next/navigation";
import { auth } from "@/auth";

type Role = "ADMIN" | "OWNER" | "USER" | null | undefined;

export default async function OwnerEntryPage() {
  const session = await auth();
  const role: Role = session?.user?.role as Role;

  if (!session?.user) {
    redirect("/auth/login?next=/owner");
  }

  if (role === "OWNER") {
    redirect("/dashboard/owner");
  }

  if (role === "ADMIN") {
    redirect("/dashboard/admin");
  }

  redirect("/dashboard");
}
