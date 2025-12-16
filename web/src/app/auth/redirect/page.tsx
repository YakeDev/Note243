import { redirect } from "next/navigation";
import { auth } from "@/auth";

const roleRedirect = (role?: string | null) => {
  if (role === "ADMIN") return "/dashboard/admin";
  if (role === "OWNER") return "/dashboard/owner";
  return "/dashboard";
};

export default async function AuthRedirectPage() {
  const session = await auth();

  if (!session?.user?.role) {
    redirect("/auth/login");
  }

  const target = roleRedirect((session.user as any).role);
  redirect(target);
}
