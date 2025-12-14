import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acces refuse" }, { status: 401 });
  }

  const claim = await prisma.claim.findUnique({
    where: { id: params.id },
  });

  if (!claim) return NextResponse.json({ error: "Revendication introuvable" }, { status: 404 });
  if (claim.status !== "PENDING") {
    return NextResponse.json({ error: "Revendication deja traitee" }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedClaim = await tx.claim.update({
      where: { id: params.id },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewedById: session.user.id as string,
        rejectReason: null,
      },
    });

    await tx.business.update({
      where: { id: updatedClaim.businessId },
      data: { ownerId: updatedClaim.userId, status: "ACTIVE" },
    });

    await tx.user.update({
      where: { id: updatedClaim.userId },
      data: { role: "OWNER" },
    });

    return updatedClaim;
  });

  return NextResponse.json({ data: result, message: "Revendication approuvee" });
}
