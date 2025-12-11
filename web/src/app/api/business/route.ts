import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { businessSchema } from "@/lib/validators/business";

export async function GET() {
  try {
    const businesses = await prisma.business.findMany({
      include: {
        category: { select: { id: true, name: true, slug: true } },
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { reviews: true, favorites: true, claims: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: businesses });
  } catch (error) {
    console.error("Failed to fetch businesses", error);
    return NextResponse.json(
      { message: "Erreur lors du chargement des etablissements" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = businessSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const business = await prisma.business.create({ data: parsed.data });
    return NextResponse.json(
      { data: business, message: "Etablissement cree avec succes" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create business", error);
    return NextResponse.json(
      { message: "Erreur lors de la creation de l'etablissement" },
      { status: 500 },
    );
  }
}
