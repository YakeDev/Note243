import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.object({
  reason: z.string().max(500).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Donnees invalides" }, { status: 400 });
  }

  const { id: suggestionId } = await params;
  if (!suggestionId) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

  const suggestion = await prisma.businessSuggestion.findUnique({
    where: { id: suggestionId },
  });
  if (!suggestion) return NextResponse.json({ error: "Suggestion introuvable" }, { status: 404 });

  if (suggestion.status !== "PENDING") {
    return NextResponse.json({ error: "Suggestion deja traitee" }, { status: 400 });
  }

  await prisma.businessSuggestion.update({
    where: { id: suggestionId },
    data: {
      status: "REJECTED",
      reviewedAt: new Date(),
      reviewedById: session.user.id as string,
      rejectReason: parsed.data.reason,
    },
  });

  return NextResponse.json({ message: "Suggestion rejetee" });
}
