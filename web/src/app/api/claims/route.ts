import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { supabaseServer } from "@/lib/supabase-server";

export const runtime = "nodejs";

const createSchema = z.object({
  businessId: z.string().uuid(),
  message: z.string().max(500).optional(),
  proofUrl: z
    .string()
    .url()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  notes: z.string().max(500).optional(),
});

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function publicUrl(path: string) {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const bucket = process.env.SUPABASE_CLAIM_BUCKET || "claim-proofs";
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

function extensionFromFile(file: File) {
  const name = file.name || "";
  const dot = name.lastIndexOf(".");
  if (dot > -1 && dot < name.length - 1) return name.slice(dot + 1).toLowerCase();
  if (file.type === "application/pdf") return "pdf";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }
  if (session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Compte proprietaire requis" }, { status: 403 });
  }

  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "Donnees invalides" }, { status: 400 });
  }

  const businessId = String(form.get("businessId") ?? "");
  const message = String(form.get("message") ?? "").trim();
  const proofUrl = String(form.get("proofUrl") ?? "").trim();
  const notes = String(form.get("notes") ?? "").trim();

  const payload = {
    businessId,
    message: message || undefined,
    proofUrl,
    notes: notes || undefined,
  };

  const parsed = createSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Donnees invalides", issues: parsed.error.format() },
      { status: 400 }
    );
  }

  const business = await prisma.business.findUnique({
    where: { id: parsed.data.businessId, status: "ACTIVE" },
  });
  if (!business) {
    return NextResponse.json({ error: "Etablissement introuvable ou inactif" }, { status: 404 });
  }

  let proofUrl = parsed.data.proofUrl;
  const proofFile = form.get("proofFile");

  if (proofFile instanceof File && proofFile.size > 0) {
    if (!ALLOWED_MIME_TYPES.has(proofFile.type)) {
      return NextResponse.json(
        { error: "Type de fichier non autorise." },
        { status: 400 }
      );
    }
    if (proofFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Le fichier depasse la taille maximale autorisee." },
        { status: 400 }
      );
    }

    const bucket = process.env.SUPABASE_CLAIM_BUCKET || "claim-proofs";
    const filename = `${crypto.randomUUID()}.${extensionFromFile(proofFile)}`;
    const path = `claims/${parsed.data.businessId}/${filename}`;

    const buffer = Buffer.from(await proofFile.arrayBuffer());
    const supabase = supabaseServer();
    const upload = await supabase.storage.from(bucket).upload(path, buffer, {
      contentType: proofFile.type,
      upsert: false,
    });

    if (upload.error) {
      return NextResponse.json({ error: upload.error.message }, { status: 500 });
    }

    proofUrl = publicUrl(path);
  }

  const claim = await prisma.claim.create({
    data: {
      businessId: parsed.data.businessId,
      userId: session.user.id as string,
      message: parsed.data.message,
      proofUrl,
      notes: parsed.data.notes,
      status: "PENDING",
    },
  });

  return NextResponse.json({ data: claim, message: "Revendication envoyee" }, { status: 201 });
}
