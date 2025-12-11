import { NextResponse } from "next/server";
import { reviewSchema } from "@/lib/validators/review";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("businessId");

  return NextResponse.json({
    data: [],
    filters: { businessId },
    message: "Listing des avis (stub)",
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = reviewSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  return NextResponse.json(
    { data: parsed.data, message: "Création d’avis à implémenter avec Prisma" },
    { status: 201 },
  );
}
