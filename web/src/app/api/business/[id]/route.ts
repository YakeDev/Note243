import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { businessSchema } from "@/lib/validators/business";

type Params = { params: Promise<{ id: string }> };

const businessInclude = {
  category: { select: { id: true, name: true, slug: true } },
  owner: { select: { id: true, name: true, email: true } },
  _count: { select: { reviews: true, favorites: true, claims: true } },
};

export async function GET(_: Request, { params }: Params) {
  try {
    const { id } = await params;
    const business = await prisma.business.findUnique({
      where: { id },
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
  const session = await auth();

  if (!session?.user?.role) {
    return NextResponse.json({ message: "Non autorise" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = businessSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const { id } = await params;
    const existing = await prisma.business.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: "Business not found" }, { status: 404 });
    }

    const isAdmin = session.user.role === "ADMIN";
    const isOwner = session.user.role === "OWNER" && existing.ownerId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ message: "Non autorise" }, { status: 403 });
    }

    const data = parsed.data;
    if (session.user.role === "OWNER") {
      data.ownerId = session.user.id;
    }

    const updated = await prisma.business.update({
      where: { id },
      data,
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

export async function DELETE(_: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Non autorise" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.business.delete({ where: { id } });
    return NextResponse.json({ message: "Business supprimé" });
  } catch (error) {
    console.error("Failed to delete business", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
