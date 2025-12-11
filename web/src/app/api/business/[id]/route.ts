import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { businessSchema } from "@/lib/validators/business";

interface Params {
  params: { id: string };
}

const businessInclude = {
  category: { select: { id: true, name: true, slug: true } },
  owner: { select: { id: true, name: true, email: true } },
  _count: { select: { reviews: true, favorites: true, claims: true } },
};

export async function GET(_: Request, { params }: Params) {
  try {
    const business = await prisma.business.findUnique({
      where: { id: params.id },
      include: businessInclude,
    });

    if (!business) {
      return NextResponse.json({ message: "Business not found" }, { status: 404 });
    }

    return NextResponse.json({ data: business });
  } catch (error) {
    console.error("Failed to fetch business", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const body = await request.json().catch(() => null);
  const parsed = businessSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const updated = await prisma.business.update({
      where: { id: params.id },
      data: parsed.data,
      include: businessInclude,
    });

    return NextResponse.json({ data: updated, message: "Business updated" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Business not found" }, { status: 404 });
    }

    console.error("Failed to update business", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
