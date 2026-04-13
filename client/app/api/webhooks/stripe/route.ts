import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ route: "webhooks/stripe", status: "received" });
}
