import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = body?.token as string | undefined;
  const password = body?.password as string | undefined;
  const confirm = body?.confirm as string | undefined;
  const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  if (!token || !password || !confirm) {
    return NextResponse.json({ message: "Champs requis manquants" }, { status: 400 });
  }
  if (password !== confirm) {
    return NextResponse.json({ message: "Les mots de passe ne correspondent pas" }, { status: 400 });
  }
  if (!pwdRegex.test(password)) {
    return NextResponse.json(
      { message: "Le mot de passe doit contenir 8 caractères, une majuscule, une minuscule et un chiffre" },
      { status: 400 },
    );
  }

  try {
    const vt = await prisma.verificationToken.findUnique({ where: { token } });
    if (!vt || vt.expires < new Date()) {
      return NextResponse.json({ message: "Token invalide ou expiré" }, { status: 400 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email: vt.identifier },
      data: { hashedPassword },
    });
    await prisma.verificationToken.deleteMany({ where: { identifier: vt.identifier } });
    return NextResponse.json({ message: "Mot de passe mis à jour. Vous pouvez vous connecter." });
  } catch (error) {
    console.error("POST /api/auth/reset-password error:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
