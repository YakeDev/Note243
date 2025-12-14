import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface Params {
  params: { businessId: string };
}

export async function DELETE(_: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Non autorise" }, { status: 401 });
  }

  try {
    await prisma.favorite.delete({
      where: { userId_businessId: { userId: session.user.id, businessId: params.businessId } },
    });
    return NextResponse.json({ message: "Favori supprime" });
  } catch (error) {
    console.error("Failed to delete favorite", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
