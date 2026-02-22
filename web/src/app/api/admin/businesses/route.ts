import { NextResponse } from "next/server";
import { z } from "zod";
import { BusinessStatus } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z
  .object({
    id: z.string().uuid(),
    status: z.nativeEnum(BusinessStatus),
    rejectReason: z.string().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.status === BusinessStatus.REJECTED &&
      (!data.rejectReason || data.rejectReason.trim().length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Motif de rejet requis.",
        path: ["rejectReason"],
      });
    }
  });

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Non autorise" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { id, status, rejectReason } = parsed.data;

  try {
    const updated = await prisma.business.update({
      where: { id },
      data: {
        status,
        rejectReason: status === BusinessStatus.REJECTED ? rejectReason?.trim() : null,
      },
      select: { id: true, name: true, status: true },
    });

    return NextResponse.json({ data: updated, message: "Statut mis a jour" });
  } catch (error) {
    console.error("PATCH /api/admin/businesses error:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
