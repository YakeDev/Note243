import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  reason: z.string().max(500).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acces refuse" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Donnees invalides" }, { status: 400 });
  }

  const { id } = await params;

  const claim = await prisma.claim.findUnique({
    where: { id },
  });
  if (!claim) return NextResponse.json({ error: "Revendication introuvable" }, { status: 404 });
  if (claim.status !== "PENDING") {
    return NextResponse.json({ error: "Revendication deja traitee" }, { status: 400 });
  }

  await prisma.claim.update({
    where: { id },
    data: {
      status: "REJECTED",
      reviewedAt: new Date(),
      reviewedById: session.user.id as string,
      rejectReason: parsed.data.reason,
    },
  });

  return NextResponse.json({ message: "Revendication rejetee" });
}
