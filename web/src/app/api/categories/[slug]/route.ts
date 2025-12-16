import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { categoryUpdateSchema } from "@/lib/validators/category";

type Params = { params: Promise<{ slug: string }> };

// GET category by slug + businesses filters
export async function GET(request: Request, { params }: Params) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const ratingParam = searchParams.get("rating");
  const minRating = ratingParam ? Number(ratingParam) : undefined;
  const hasRating = Number.isFinite(minRating);
  const city = searchParams.get("city") ?? undefined;
  const sort = searchParams.get("sort") ?? "recent"; // popularity | rating | recent

  const whereBusiness: Prisma.BusinessWhereInput = {
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {}),
    ...(city ? { city: { contains: city, mode: Prisma.QueryMode.insensitive } } : {}),
    ...(hasRating
      ? {
          reviews: {
            some: {
              rating: { gte: minRating as number },
            },
          },
        }
      : {}),
  };

  const category = await prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      icon: true,
      parentId: true,
      parent: { select: { id: true, name: true, slug: true } },
      _count: { select: { businesses: true, children: true } },
      children: { select: { id: true, name: true, slug: true } },
      businesses: {
        where: whereBusiness,
        include: {
          _count: { select: { reviews: true } },
          category: { select: { name: true } },
          reviews: { select: { rating: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!category) {
    return NextResponse.json({ message: "Categorie non trouvée" }, { status: 404 });
  }

  const businesses = (category.businesses ?? []).map(({ reviews, ...biz }) => {
    const ratings = reviews?.map((r) => r.rating) ?? [];
    const averageRating =
      ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : null;
    return {
      ...biz,
      averageRating,
    };
  });

  const sortedBusinesses =
    sort === "rating"
      ? [...businesses].sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0))
      : sort === "popularity"
        ? [...businesses].sort((a, b) => (b._count?.reviews ?? 0) - (a._count?.reviews ?? 0))
        : businesses;

  return NextResponse.json({ data: { ...category, businesses: sortedBusinesses } });
}

// PATCH/DELETE admin only
export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.role || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  const { slug } = await params;
  const body = await request.json().catch(() => null);
  const parsed = categoryUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const payload = parsed.data;
    const newSlug = payload.slug ? slugify(payload.slug) : undefined;
    const updated = await prisma.category.update({
      where: { slug },
      data: { ...payload, ...(newSlug ? { slug: newSlug } : {}) },
      select: { id: true, name: true, slug: true, description: true, icon: true, parentId: true },
    });
    return NextResponse.json({ data: updated });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ message: "Categorie non trouvée" }, { status: 404 });
    }
    if (error.code === "P2002") {
      return NextResponse.json({ message: "Slug déjà utilisé" }, { status: 409 });
    }
    console.error("PATCH /api/categories/[slug] error:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.role || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  const { slug } = await params;

  try {
    const count = await prisma.business.count({ where: { category: { slug } } });
    if (count > 0) {
      return NextResponse.json(
        { message: "Impossible de supprimer : catégorie associée à des établissements" },
        { status: 400 },
      );
    }

    await prisma.category.delete({ where: { slug } });
    return NextResponse.json({ message: "Catégorie supprimée" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ message: "Categorie non trouvée" }, { status: 404 });
    }
    console.error("DELETE /api/categories/[slug] error:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
