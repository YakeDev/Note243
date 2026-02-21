import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  reply: z.string().max(1000).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "Non autorise" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ message: "Donnees invalides" }, { status: 400 });
  }

  const { id } = await params;
  const reply = parsed.data.reply?.trim() ?? "";

  const review = await prisma.review.findUnique({
    where: { id },
    select: {
      id: true,
      business: { select: { ownerId: true } },
    },
  });

  if (!review) {
    return NextResponse.json({ message: "Review not found" }, { status: 404 });
  }

  const isOwner = review.business?.ownerId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ message: "Non autorise" }, { status: 403 });
  }

  const updated = await prisma.review.update({
    where: { id },
    data: {
      ownerReply: reply.length > 0 ? reply : null,
      ownerRepliedAt: reply.length > 0 ? new Date() : null,
    },
  });

  return NextResponse.json({ data: updated });
}
