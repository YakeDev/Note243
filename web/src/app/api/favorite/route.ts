import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Non autorise" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("businessId");

  if (businessId) {
    const exists = await prisma.favorite.findUnique({
      where: { userId_businessId: { userId: session.user.id, businessId } },
    });
    return NextResponse.json({ favorited: !!exists });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      business: {
        select: {
          id: true,
          name: true,
          city: true,
          category: { select: { name: true } },
          _count: { select: { reviews: true } },
        },
      },
    },
  });

  return NextResponse.json({ data: favorites });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Non autorise" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const businessId = body?.businessId as string | undefined;

  if (!businessId) {
    return NextResponse.json({ message: "businessId requis" }, { status: 400 });
  }

  try {
    await prisma.business.findUniqueOrThrow({ where: { id: businessId } });
    const fav = await prisma.favorite.upsert({
      where: { userId_businessId: { userId: session.user.id, businessId } },
      update: {},
      create: { userId: session.user.id, businessId },
    });
    return NextResponse.json({ data: fav }, { status: 201 });
  } catch (error) {
    console.error("Failed to favorite", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
