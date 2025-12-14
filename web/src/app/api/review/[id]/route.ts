import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validators/review";

interface Params {
  params: { id: string };
}

const reviewInclude = {
  user: { select: { id: true, name: true, email: true } },
  business: { select: { id: true, name: true } },
};

export async function DELETE(_: Request, { params }: Params) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Non autorise" }, { status: 401 });
  }

  try {
    const existing = await prisma.review.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ message: "Review not found" }, { status: 404 });
    }

    const isAdmin = session.user.role === "ADMIN";
    const isOwner = existing.userId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ message: "Non autorise" }, { status: 403 });
    }

    await prisma.review.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Review deleted" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Review not found" }, { status: 404 });
    }
    console.error("Failed to delete review", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Non autorise" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = reviewSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const data = parsed.data;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ message: "Aucune donnee a mettre a jour" }, { status: 400 });
  }

  try {
    const existing = await prisma.review.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ message: "Review not found" }, { status: 404 });
    }

    const isAdmin = session.user.role === "ADMIN";
    const isOwner = existing.userId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ message: "Non autorise" }, { status: 403 });
    }

    if (data.businessId) {
      const business = await prisma.business.findUnique({ where: { id: data.businessId } });
      if (!business) {
        return NextResponse.json({ message: "Business not found" }, { status: 404 });
      }
    }

    // Prevent userId reassignment unless admin explicitly changes
    if (!isAdmin) {
      data.userId = existing.userId;
    }

    const updated = await prisma.review.update({
      where: { id: params.id },
      data,
      include: reviewInclude,
    });

    return NextResponse.json({ data: updated, message: "Review updated" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Review not found" }, { status: 404 });
    }
    console.error("Failed to update review", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
