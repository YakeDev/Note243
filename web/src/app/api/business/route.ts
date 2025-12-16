import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { businessSchema } from "@/lib/validators/business";

// GET /api/business?search=&categoryId=
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? undefined;
    const categoryId = searchParams.get("categoryId") ?? undefined;
    const statusParam = searchParams.get("status");
    const status = statusParam ? (statusParam as any) : undefined;
    const q = search?.trim();

    let categoryIds: string[] | undefined;
    if (categoryId) {
      const children = await prisma.category.findMany({
        where: { parentId: categoryId },
        select: { id: true },
      });
      categoryIds = [categoryId, ...children.map((c) => c.id)];
    }

    const where: Prisma.BusinessWhereInput =
      q || categoryId || status
        ? {
            ...(status ? { status } : {}),
            ...(categoryIds ? { categoryId: { in: categoryIds } } : {}),
            ...(q
              ? {
                  OR: [
                    { name: { contains: q, mode: Prisma.QueryMode.insensitive } },
                    { description: { contains: q, mode: Prisma.QueryMode.insensitive } },
                    { city: { contains: q, mode: Prisma.QueryMode.insensitive } },
                  ],
                }
              : {}),
          }
        : {};

    const businesses = await prisma.business.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { reviews: true, favorites: true, claims: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: businesses }, { status: 200 });
  } catch (error) {
    console.error("GET /api/business error:", error);
    return NextResponse.json(
      { message: "Erreur lors du chargement des etablissements" },
      { status: 500 },
    );
  }
}

// POST /api/business
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.role) {
      return NextResponse.json({ message: "Non autorise" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN" && session.user.role !== "OWNER") {
      return NextResponse.json({ message: "Non autorise" }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const parsed = businessSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation error", errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const payload = { ...parsed.data };
    if (session.user.role === "OWNER") {
      payload.ownerId = session.user.id;
    }

    const business = await prisma.business.create({ data: payload });
    return NextResponse.json({ data: business, message: "Etablissement cree avec succes" }, { status: 201 });
  } catch (error) {
    console.error("POST /api/business error:", error);
    return NextResponse.json(
      { message: "Erreur lors de la creation de l'etablissement" },
      { status: 500 },
    );
  }
}
