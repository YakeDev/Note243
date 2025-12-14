import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const statusSchema = z.enum(["PENDING", "RESOLVED", "DISMISSED"]);
const updateSchema = z.object({
  id: z.string().uuid(),
  status: statusSchema,
  hideReview: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      review: {
        select: {
          id: true,
          comment: true,
          rating: true,
          status: true,
          business: { select: { id: true, name: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      },
      reporter: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json({ data: reports });
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

  const { id, status, hideReview } = parsed.data;

  try {
    const report = await prisma.report.update({
      where: { id },
      data: { status },
    });

    if (hideReview && report.reviewId) {
      await prisma.review.update({
        where: { id: report.reviewId },
        data: { status: "HIDDEN" },
      });
    }

    return NextResponse.json({ message: "Statut mis à jour" });
  } catch (error) {
    console.error("PATCH /api/admin/reports error", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
