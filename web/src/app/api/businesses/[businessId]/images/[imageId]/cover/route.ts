import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canManageBusinessImages } from "@/lib/permissions";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ businessId: string; imageId: string }> },
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { businessId, imageId } = await ctx.params;

  const allowed = await canManageBusinessImages(session.user as any, businessId);
  if (!allowed) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });

  const img = await prisma.$transaction(async (tx) => {
    await tx.businessImage.updateMany({ where: { businessId }, data: { isCover: false } });
    return tx.businessImage.update({ where: { id: imageId }, data: { isCover: true } });
  });

  return NextResponse.json({ image: img });
}
