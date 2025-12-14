import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login?verified=0", request.url));
  }

  const record = await prisma.emailVerificationToken.findUnique({ where: { token } });
  if (!record) {
    return NextResponse.redirect(new URL("/auth/login?verified=0", request.url));
  }

  if (record.expiresAt < new Date()) {
    await prisma.emailVerificationToken.delete({ where: { id: record.id } });
    return NextResponse.redirect(new URL("/auth/login?verified=0", request.url));
  }

  await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerified: new Date() },
  });

  await prisma.emailVerificationToken.delete({ where: { id: record.id } });

  return NextResponse.redirect(new URL("/auth/login?verified=1", request.url));
}
