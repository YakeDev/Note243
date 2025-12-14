import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const statusSchema = z.enum(["PUBLISHED", "HIDDEN", "REMOVED"]);
const updateSchema = z.object({
  id: z.string().uuid(),
  status: statusSchema,
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");
  const status = statusParam && statusSchema.safeParse(statusParam).success ? statusParam : undefined;
  const limit = Number(searchParams.get("limit") ?? 100);

  const reviews = await prisma.review.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
    },
    take: isNaN(limit) ? 100 : limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      business: { select: { id: true, name: true } },
      _count: { select: { reports: true } },
    },
  });

  return NextResponse.json({ data: reviews });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { id, status } = parsed.data;

  try {
    const review = await prisma.review.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { id: true, name: true, email: true } },
        business: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json({ data: review });
  } catch (error) {
    console.error("PATCH /api/admin/reviews error", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const id = body?.id as string | undefined;
  if (!id) {
    return NextResponse.json({ message: "id manquant" }, { status: 400 });
  }

  try {
    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ message: "Avis supprimé" });
  } catch (error) {
    console.error("DELETE /api/admin/reviews error", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
