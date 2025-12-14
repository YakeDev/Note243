import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validators/review";

const businessIdSchema = z.string().uuid();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("businessId");

  const where: { businessId?: string } = {};

  if (businessId) {
    const parsedBusinessId = businessIdSchema.safeParse(businessId);
    if (!parsedBusinessId.success) {
      return NextResponse.json(
        { errors: { businessId: ["businessId invalide"] } },
        { status: 400 },
      );
    }

    const exists = await prisma.business.findUnique({ where: { id: businessId } });
    if (!exists) {
      return NextResponse.json({ message: "Business not found" }, { status: 404 });
    }

    where.businessId = businessId;
  }

  try {
    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        business: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: reviews, filters: { businessId } });
  } catch (error) {
    console.error("Failed to fetch reviews", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Non autorise" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = reviewSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { businessId, ...rest } = parsed.data;
  const userId = session.user.id;

  try {
    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) {
      return NextResponse.json({ message: "Business not found" }, { status: 404 });
    }

    const review = await prisma.review.create({
      data: { businessId, userId, ...rest },
      include: {
        user: { select: { id: true, name: true, email: true } },
        business: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ data: review, message: "Review created" }, { status: 201 });
  } catch (error) {
    console.error("Failed to create review", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
