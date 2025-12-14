import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { categoryCreateSchema } from "@/lib/validators/category";

// Public: list categories with children and counts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;

  const categories = await prisma.category.findMany({
    where: {
      ...(search
        ? { name: { contains: search, mode: "insensitive" } }
        : { parentId: null }),
    },
    include: {
      _count: { select: { businesses: true, children: true } },
      children: {
        include: { _count: { select: { businesses: true } } },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ data: categories, count: categories.length });
}

// Admin: create category
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.role || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = categoryCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const payload = parsed.data;
    const slug = slugify(payload.slug || payload.name);
    const category = await prisma.category.create({
      data: { ...payload, slug },
      select: { id: true, name: true, slug: true, description: true, icon: true, parentId: true },
    });
    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ message: "Slug déjà utilisé" }, { status: 409 });
    }
    console.error("POST /api/categories error:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
