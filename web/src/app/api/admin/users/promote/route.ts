import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  email: z.string().email(),
  role: z.enum(["USER", "OWNER", "ADMIN"]).default("ADMIN"),
  verifyEmail: z.boolean().default(true),
});

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    if ((session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    const json = await req.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides.", issues: parsed.error.format() },
        { status: 400 }
      );
    }

    const { email, role, verifyEmail } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { email },
      data: {
        role,
        emailVerified: verifyEmail ? new Date() : user.emailVerified,
      },
      select: { id: true, email: true, role: true, emailVerified: true, status: true },
    });

    return NextResponse.json({ success: true, user: updated }, { status: 200 });
  } catch (e) {
    console.error("POST /api/admin/users/promote error:", e);
    return NextResponse.json({ error: "Erreur interne." }, { status: 500 });
  }
}
