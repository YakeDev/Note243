import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  const [businesses, reviews, reportsPending, claimsPending, users] = await Promise.all([
    prisma.business.count(),
    prisma.review.count(),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.claim.count({ where: { status: "PENDING" } }),
    prisma.user.count(),
  ]);

  return NextResponse.json({
    data: {
      businesses,
      reviews,
      reportsPending,
      claimsPending,
      users,
    },
  });
}
