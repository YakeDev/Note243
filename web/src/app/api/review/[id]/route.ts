import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { reviewUpdateSchema } from "@/lib/validators/review";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "Non autorise" }, { status: 401 });
  }

  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = reviewUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const existing = await prisma.review.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!existing) return NextResponse.json({ message: "Review not found" }, { status: 404 });

    const isOwner = existing.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ message: "Non autorise" }, { status: 403 });
    }

    const updated = await prisma.review.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ data: updated, message: "Review updated" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Review not found" }, { status: 404 });
    }
    console.error("PATCH /api/review/[id] error", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "Non autorise" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.review.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!existing) return NextResponse.json({ message: "Review not found" }, { status: 404 });

    const isOwner = existing.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ message: "Non autorise" }, { status: 403 });
    }

    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ message: "Review supprimée" });
  } catch (error) {
    console.error("DELETE /api/review/[id] error", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
