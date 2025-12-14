import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = (body?.email as string | undefined)?.toLowerCase().trim();
  if (!email) {
    return NextResponse.json({ message: "Email requis" }, { status: 400 });
  }

  // Réponse générique pour ne pas divulguer l’existence de l’email
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const token = randomUUID();
      const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 min
      await prisma.verificationToken.deleteMany({ where: { identifier: email } });
      await prisma.verificationToken.create({ data: { identifier: email, token, expires } });
      // TODO: envoyer l'email avec le lien /auth/reset-password?token=...
    }
    return NextResponse.json({
      message: "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.",
    });
  } catch (error) {
    console.error("POST /api/auth/reset-request error:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
