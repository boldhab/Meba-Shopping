import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ route: "register", status: "placeholder" }, { status: 201 });
}
