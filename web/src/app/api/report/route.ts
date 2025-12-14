import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Non autorise" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const reviewId = body?.reviewId as string | undefined;
  const reason = body?.reason as string | undefined;
  const details = body?.details as string | undefined;

  if (!reviewId || !reason) {
    return NextResponse.json({ message: "reviewId et reason requis" }, { status: 400 });
  }

  try {
    await prisma.review.findUniqueOrThrow({ where: { id: reviewId } });
    const report = await prisma.report.create({
      data: {
        reviewId,
        reason,
        details,
        reporterId: session.user.id,
      },
    });
    return NextResponse.json({ data: report, message: "Signalement cree" }, { status: 201 });
  } catch (error) {
    console.error("Failed to create report", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
