import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  }
  const adminId = session.user.id as string;

  const { id: suggestionId } = await params;
  if (!suggestionId) {
    return NextResponse.json({ error: "ID manquant" }, { status: 400 });
  }

  const suggestion = await prisma.businessSuggestion.findUnique({
    where: { id: suggestionId },
  });

  if (!suggestion) {
    return NextResponse.json({ error: "Suggestion introuvable" }, { status: 404 });
  }
  if (suggestion.status !== "PENDING") {
    return NextResponse.json({ error: "Suggestion deja traitee" }, { status: 400 });
  }

  const business = await prisma.$transaction(async (tx) => {
    const created = await tx.business.create({
      data: {
        name: suggestion.name,
        categoryId: suggestion.categoryId,
        address: suggestion.location,
        phone: suggestion.phone,
        website: suggestion.website,
        status: "ACTIVE",
      },
    });

    await tx.businessSuggestion.update({
      where: { id: suggestionId },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewedById: adminId,
      },
    });

    return created;
  });

  return NextResponse.json({ data: business, message: "Suggestion approuvee" });
}
