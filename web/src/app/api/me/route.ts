import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Non autorise" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { reviews: true, favorites: true } },
    },
  });

  return NextResponse.json({ data: user });
}

const profileSchema = z
  .object({
    name: z.string().min(2, "Nom trop court").optional(),
    email: z.string().email("Email invalide").optional(),
  })
  .refine((data) => data.name || data.email, {
    message: "Aucun changement",
    path: ["name"],
  });

const TOKEN_EXPIRES_HOURS = 24;

function emailTemplate(verifyUrl: string) {
  return `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; padding: 24px;">
    <h2 style="margin: 0 0 12px; color: #1d4ed8;">Confirmez votre adresse email</h2>
    <p style="margin: 0 0 16px;">Merci d'avoir mis a jour votre email. Cliquez sur le bouton ci-dessous pour verifier votre email.</p>
    <a href="${verifyUrl}" style="display: inline-block; background: #1d4ed8; color: #fff; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: 600;">Verifier mon email</a>
    <p style="margin: 16px 0 0; font-size: 14px;">Ou copiez-collez ce lien dans votre navigateur :</p>
    <p style="word-break: break-all; font-size: 13px;">${verifyUrl}</p>
    <p style="margin-top: 24px; font-size: 13px; color: #475569;">— Note243</p>
  </div>`;
}

function emailTextTemplate(verifyUrl: string) {
  return `Confirmez votre adresse email

Votre email a ete mis a jour.

Pour verifier votre email, ouvrez ce lien :
${verifyUrl}

— Note243`;
}

function getBaseUrl(req: Request): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL;
  if (envUrl) return envUrl;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  try {
    const { origin } = new URL(req.url);
    return origin;
  } catch {
    return "http://localhost:3000";
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", issues: parsed.error.format() },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true },
  });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const updateData: Record<string, any> = {};
  let warning: string | undefined;

  if (parsed.data.name && parsed.data.name !== "") {
    updateData.name = parsed.data.name;
  }

  if (parsed.data.email) {
    const normalizedEmail = parsed.data.email.toLowerCase();
    if (normalizedEmail !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existing) {
        return NextResponse.json({ error: "Cet email est deja utilise." }, { status: 400 });
      }

      updateData.email = normalizedEmail;
      updateData.emailVerified = null;

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRES_HOURS * 60 * 60 * 1000);

      await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });
      await prisma.emailVerificationToken.create({
        data: {
          token,
          userId: user.id,
          expiresAt,
        },
      });

      const baseUrl = getBaseUrl(request);
      const verifyUrl = `${baseUrl}/auth/verify?token=${token}`;

      const port = Number(process.env.SMTP_PORT ?? 587);
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const from = process.env.EMAIL_FROM ?? process.env.SMTP_FROM;

      try {
        if (!from) {
          warning =
            "Email modifie mais l'email de verification n'a pas pu etre envoye (EMAIL_FROM/SMTP_FROM manquant).";
        } else {
          await transporter.sendMail({
            from,
            to: normalizedEmail,
            subject: "Confirmez votre adresse email",
            html: emailTemplate(verifyUrl),
            text: emailTextTemplate(verifyUrl),
          });
        }
      } catch (mailErr) {
        console.error("PROFILE email send error:", mailErr);
        warning =
          "Email modifie mais l'email de verification n'a pas pu etre envoye. Verifiez la configuration SMTP.";
      }
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "Aucun changement" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: updateData,
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json({ data: updated, warning });
}
