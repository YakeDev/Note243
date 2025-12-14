import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["ACTIVE", "SUSPENDED"]),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      _count: { select: { reviews: true, businesses: true, reports: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: users });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { id, status } = parsed.data;

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json({ data: user });
  } catch (error) {
    console.error("PATCH /api/admin/users error", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
