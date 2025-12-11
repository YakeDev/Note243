import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { message: "NextAuth non configuré. Ajouter les providers avant usage." },
    { status: 501 },
  );
}

export async function POST() {
  return NextResponse.json(
    { message: "NextAuth non configuré. Ajouter les providers avant usage." },
    { status: 501 },
  );
}
