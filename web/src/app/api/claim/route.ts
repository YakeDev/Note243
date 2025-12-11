import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "Revendication à implémenter (stub)" },
    { status: 501 },
  );
}

export async function GET() {
  return NextResponse.json({ data: [], message: "Listing des revendications (stub)" });
}
