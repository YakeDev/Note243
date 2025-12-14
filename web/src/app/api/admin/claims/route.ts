import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Non autorise" }, { status: 401 });
  }

  const claims = await prisma.claim.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      business: { select: { id: true, name: true, ownerId: true } },
      user: { select: { id: true, name: true, email: true } },
      reviewedBy: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json({ data: claims });
}
