import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acces refuse" }, { status: 401 });
  }

  const { id } = await params;

  const claim = await prisma.claim.findUnique({ where: { id } });
  if (!claim) return NextResponse.json({ error: "Revendication introuvable" }, { status: 404 });

  if (claim.status === "PENDING") {
    return NextResponse.json({ data: claim, message: "Revendication deja en attente" });
  }

  const updated = await prisma.claim.update({
    where: { id },
    data: {
      status: "PENDING",
      reviewedAt: null,
      reviewedById: null,
      rejectReason: null,
    },
  });

  return NextResponse.json({ data: updated, message: "Revendication remise en attente" });
}
