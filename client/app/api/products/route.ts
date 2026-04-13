import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ route: "products", method: "GET" });
}

export async function POST() {
  return NextResponse.json({ route: "products", method: "POST" }, { status: 201 });
}
