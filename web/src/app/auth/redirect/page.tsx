import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const roleRedirect = (role?: string | null) => {
  if (role === "ADMIN") return "/dashboard/admin";
  if (role === "OWNER") return "/dashboard/owner";
  return "/";
};

export default async function AuthRedirectPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.role) {
    redirect("/auth");
  }

  const target = roleRedirect(session.user.role);
  redirect(target);
}
