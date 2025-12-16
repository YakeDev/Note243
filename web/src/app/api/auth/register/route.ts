import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators/auth";
import { rateLimit } from "@/lib/rateLimiter";
import { resolveAppUrl } from "@/lib/appUrls";

const TOKEN_EXPIRES_HOURS = 24;

function emailTemplate(verifyUrl: string) {
  return `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; padding: 24px;">
    <h2 style="margin: 0 0 12px; color: #1d4ed8;">Confirmez votre adresse email</h2>
    <p style="margin: 0 0 16px;">Merci de rejoindre Note243. Cliquez sur le bouton ci-dessous pour vérifier votre email.</p>
    <a href="${verifyUrl}" style="display: inline-block; background: #1d4ed8; color: #fff; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: 600;">Vérifier mon email</a>
    <p style="margin: 16px 0 0; font-size: 14px;">Ou copiez-collez ce lien dans votre navigateur :</p>
    <p style="word-break: break-all; font-size: 13px;">${verifyUrl}</p>
    <p style="margin-top: 24px; font-size: 13px; color: #475569;">— Note243</p>
  </div>`;
}

export async function POST(request: Request) {
  try {
    // Rate limit basique par IP
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    if (!rateLimit(`register:${ip}`, { tokens: 5, refillTokens: 5, windowMs: 60_000 })) {
      return NextResponse.json(
        { error: "Trop de tentatives, réessayez dans une minute." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", issues: parsed.error.format() },
        { status: 400 },
      );
    }

    const { name, email, password, accountType } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = accountType === "OWNER" ? "OWNER" : "USER";

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        hashedPassword,
        role,
        emailVerified: null,
      },
      select: { id: true, email: true },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRES_HOURS * 60 * 60 * 1000);

    await prisma.emailVerificationToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    const baseUrl = resolveAppUrl({ url: request.url });
    const verifyUrl = `${baseUrl}/auth/verify?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    let warning: string | undefined;
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: user.email,
        subject: "Confirmez votre adresse email",
        html: emailTemplate(verifyUrl),
      });
    } catch (mailErr) {
      console.error("REGISTER email send error:", mailErr);
      warning =
        "Compte créé mais l'email n'a pas pu être envoyé. Vérifiez la configuration SMTP ou contactez le support.";
    }

    return NextResponse.json({ success: true, warning }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/auth/register error:", error);

    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 400 });
    }

    if (typeof error?.message === "string" && error.message.includes("SSL connection is required")) {
      return NextResponse.json(
        { error: "Erreur de connexion à la base (SSL). Vérifie la DATABASE_URL (sslmode)." },
        { status: 500 },
      );
    }

    if (
      typeof error?.message === "string" &&
      error.message.includes("self-signed certificate")
    ) {
      return NextResponse.json(
        {
          error:
            "Erreur de certificat SSL. En dev, ajoute sslmode=require ou sslaccept=accept_invalid_certs.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Erreur interne du serveur lors de l'inscription." },
      { status: 500 },
    );
  }
}
