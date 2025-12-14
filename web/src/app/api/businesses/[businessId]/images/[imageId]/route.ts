import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { supabaseServer } from "@/lib/supabase-server";
import { canManageBusinessImages } from "@/lib/permissions";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ businessId: string; imageId: string }> },
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { businessId, imageId } = await ctx.params;

  const allowed = await canManageBusinessImages(session.user as any, businessId);
  if (!allowed) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });

  const img = await prisma.businessImage.findUnique({ where: { id: imageId } });
  if (!img || img.businessId !== businessId) {
    return NextResponse.json({ error: "Image introuvable." }, { status: 404 });
  }

  await prisma.businessImage.delete({ where: { id: imageId } });

  const supabase = supabaseServer();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "business-images";
  const rm = await supabase.storage.from(bucket).remove([img.path]);

  if (rm.error) {
    return NextResponse.json({
      warning: "Image supprimée en base, mais pas dans le storage.",
      detail: rm.error.message,
    });
  }

  return NextResponse.json({ success: true });
}
