import { BusinessStatus, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { businessSchema } from "@/lib/validators/business";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const cacheControl = { headers: { "Cache-Control": "no-store, max-age=0" } } as const;

// GET /api/business?search=&categoryId=
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchRaw = searchParams.get("search")?.trim();
    const search = searchRaw && searchRaw.length > 0 ? searchRaw : undefined;
    const categoryIdRaw = searchParams.get("categoryId")?.trim();
    const categoryId = categoryIdRaw && categoryIdRaw.length > 0 ? categoryIdRaw : undefined;
    const statusParam = searchParams.get("status");
    const sort = searchParams.get("sort") ?? "recent";
    const minRatingRaw = searchParams.get("minRating");
    const parsedMinRating = minRatingRaw ? Number.parseInt(minRatingRaw, 10) : null;
    const minRating =
      parsedMinRating && Number.isFinite(parsedMinRating)
        ? Math.min(Math.max(parsedMinRating, 1), 5)
        : null;

    const orderBy: Prisma.BusinessOrderByWithRelationInput = (() => {
      if (sort === "reviews") return { reviews: { _count: "desc" } };
      if (sort === "rating") return { reviews: { _avg: { rating: "desc" } } };
      return { createdAt: "desc" };
    })();
    const status = statusParam && Object.values(BusinessStatus).includes(statusParam as BusinessStatus)
      ? (statusParam as BusinessStatus)
      : undefined;
    const q = search;

    let categoryIds: string[] | undefined;
    if (categoryId) {
      const children = await prisma.category.findMany({
        where: { parentId: categoryId },
        select: { id: true },
      });
      categoryIds = [categoryId, ...children.map((c) => c.id)];
    }

    const where: Prisma.BusinessWhereInput = {
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
      ...(minRating ? { reviews: { some: { rating: { gte: minRating } } } } : {}),
    };

    const businesses = await prisma.business.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { reviews: true, favorites: true, claims: true } },
        reviews: { select: { rating: true } },
      },
      orderBy,
    });

    const withAverages = businesses.map((biz) => {
      const ratings = biz.reviews.map((r) => r.rating);
      const rating = ratings.length
        ? Number((ratings.reduce((acc, val) => acc + val, 0) / ratings.length).toFixed(2))
        : 0;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { reviews, ...rest } = biz;
      return { ...rest, rating };
    });

    return NextResponse.json({ data: withAverages }, { status: 200, ...cacheControl });
  } catch (error) {
    console.error("GET /api/business error:", error);
    return NextResponse.json(
      { message: "Erreur lors du chargement des etablissements" },
      { status: 500, ...cacheControl },
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
    return NextResponse.json(
      { data: business, message: "Etablissement cree avec succes" },
      { status: 201, ...cacheControl },
    );
  } catch (error) {
    console.error("POST /api/business error:", error);
    return NextResponse.json(
      { message: "Erreur lors de la creation de l'etablissement" },
      { status: 500, ...cacheControl },
    );
  }
}
