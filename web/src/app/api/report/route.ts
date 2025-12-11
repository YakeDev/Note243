import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "Signalement à implémenter (stub)" }, { status: 501 });
}

export async function GET() {
  return NextResponse.json({ data: [], message: "Listing des signalements (stub)" });
}
