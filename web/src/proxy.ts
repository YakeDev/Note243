import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const roleRedirect = (role?: string | null) => {
  if (role === "ADMIN") return "/dashboard/admin";
  if (role === "OWNER") return "/dashboard/owner";
  return "/";
};

export default async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const role = token?.role as string | undefined;
  const { pathname } = req.nextUrl;

  const requireAuth =
    pathname.startsWith("/dashboard/admin") || pathname.startsWith("/dashboard/owner");

  if (!token && requireAuth) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Protect admin dashboard
  if (pathname.startsWith("/dashboard/admin")) {
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL(roleRedirect(role), req.url));
    }
    return NextResponse.next();
  }

  // Protect owner dashboard
  if (pathname.startsWith("/dashboard/owner")) {
    if (role !== "OWNER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL(roleRedirect(role), req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/admin/:path*", "/dashboard/owner/:path*"],
};
