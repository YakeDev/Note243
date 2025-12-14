import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  businessId: z.string().uuid(),
  message: z.string().max(500).optional(),
  proofUrl: z
    .string()
    .url()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  notes: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Donnees invalides", issues: parsed.error.format() },
      { status: 400 }
    );
  }

  const business = await prisma.business.findUnique({
    where: { id: parsed.data.businessId, status: "ACTIVE" },
  });
  if (!business) {
    return NextResponse.json({ error: "Etablissement introuvable ou inactif" }, { status: 404 });
  }

  const claim = await prisma.claim.create({
    data: {
      businessId: parsed.data.businessId,
      userId: session.user.id as string,
      message: parsed.data.message,
      proofUrl: parsed.data.proofUrl,
      notes: parsed.data.notes,
      status: "PENDING",
    },
  });

  return NextResponse.json({ data: claim, message: "Revendication envoyee" }, { status: 201 });
}
