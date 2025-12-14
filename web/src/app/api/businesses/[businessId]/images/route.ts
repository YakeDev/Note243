import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { supabaseServer } from "@/lib/supabase-server";
import { canManageBusinessImages } from "@/lib/permissions";

export const runtime = "nodejs";

function publicUrl(path: string) {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "business-images";
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

export async function GET(_req: Request, ctx: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await ctx.params;

  const images = await prisma.businessImage.findMany({
    where: { businessId },
    orderBy: [{ isCover: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ images });
}

export async function POST(req: Request, ctx: { params: Promise<{ businessId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { businessId } = await ctx.params;

  const allowed = await canManageBusinessImages(session.user as any, businessId);
  if (!allowed) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });

  const form = await req.formData();
  const files = form.getAll("files") as File[];
  const makeCover = form.get("makeCover") === "true";

  if (!files.length) {
    return NextResponse.json({ error: "Aucun fichier." }, { status: 400 });
  }

  const supabase = supabaseServer();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "business-images";

  const existingCover = await prisma.businessImage.findFirst({
    where: { businessId, isCover: true },
    select: { id: true },
  });

  const created: any[] = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Fichier invalide (image seulement)." }, { status: 400 });
    }

    const ext = file.type.includes("png")
      ? "png"
      : file.type.includes("webp")
        ? "webp"
        : "jpg";

    const filename = `${crypto.randomUUID()}.${ext}`;
    const path = `business/${businessId}/${filename}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const upload = await supabase.storage.from(bucket).upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

    if (upload.error) {
      return NextResponse.json({ error: upload.error.message }, { status: 500 });
    }

    const url = publicUrl(path);

    const shouldBeCover = makeCover || (!existingCover && created.length === 0);

    if (shouldBeCover) {
      const img = await prisma.$transaction(async (tx) => {
        await tx.businessImage.updateMany({
          where: { businessId },
          data: { isCover: false },
        });

        return tx.businessImage.create({
          data: { businessId, url, path, isCover: true },
        });
      });

      created.push(img);
    } else {
      const img = await prisma.businessImage.create({
        data: { businessId, url, path, isCover: false },
      });
      created.push(img);
    }
  }

  return NextResponse.json({ created }, { status: 201 });
}
