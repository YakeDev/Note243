import { NextResponse } from "next/server";
import { reviewSchema } from "@/lib/validators/review";

interface Params {
  params: { id: string };
}

export async function DELETE(_: Request, { params }: Params) {
  return NextResponse.json({ id: params.id, message: "Suppression d’avis (stub)" });
}

export async function PATCH(request: Request, { params }: Params) {
  const body = await request.json().catch(() => null);
  const parsed = reviewSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  return NextResponse.json(
    { data: { id: params.id, ...parsed.data }, message: "Mise à jour d’avis (stub)" },
    { status: 200 },
  );
}
