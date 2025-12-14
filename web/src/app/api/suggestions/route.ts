import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  name: z.string().min(2),
  categoryId: z.string().uuid(),
  location: z.string().max(255).optional(),
  phone: z.string().max(50).optional(),
  website: z
    .string()
    .url()
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", issues: parsed.error.format() },
      { status: 400 }
    );
  }

  const { name, categoryId, location, phone, website } = parsed.data;

  const suggestion = await prisma.businessSuggestion.create({
    data: {
      name,
      categoryId,
      location,
      phone,
      website,
      submittedById: session.user.id as string,
    },
  });

  return NextResponse.json({ data: suggestion, message: "Suggestion envoyee" }, { status: 201 });
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acces refuse" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? undefined;

  const suggestions = await prisma.businessSuggestion.findMany({
    where: status ? { status: status as any } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { id: true, name: true } },
      submittedBy: { select: { id: true, name: true, email: true } },
      reviewedBy: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json({ data: suggestions });
}
