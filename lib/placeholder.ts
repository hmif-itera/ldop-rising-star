import { NextResponse } from "next/server";

export function notImplemented() {
  return NextResponse.json(
    { message: "Endpoint ini masih berupa kerangka." },
    { status: 501 },
  );
}
