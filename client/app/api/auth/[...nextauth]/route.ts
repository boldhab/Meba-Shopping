import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ route: "nextauth", status: "placeholder" });
}

export async function POST() {
  return NextResponse.json({ route: "nextauth", status: "placeholder" });
}
