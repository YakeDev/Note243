import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ businessId: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "Non authentifie" }, { status: 401 });
  }
  const { businessId } = await params;

  await prisma.favorite.upsert({
    where: { userId_businessId: { userId: session.user.id as string, businessId } },
    update: {},
    create: { userId: session.user.id as string, businessId },
  });

  return NextResponse.json({ message: "Ajoute aux favoris" });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ businessId: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "Non authentifie" }, { status: 401 });
  }
  const { businessId } = await params;

  await prisma.favorite.deleteMany({
    where: { userId: session.user.id as string, businessId },
  });

  return NextResponse.json({ message: "Retire des favoris" });
}
