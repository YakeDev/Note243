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

  const suggestion = await prisma.businessSuggestion.findUnique({
    where: { id: params.id },
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
      where: { id: params.id },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewedById: session.user.id as string,
      },
    });

    return created;
  });

  return NextResponse.json({ data: business, message: "Suggestion approuvee" });
}
