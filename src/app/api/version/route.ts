import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Version actuellement en ligne : comparée par les pages ouvertes pour proposer la mise à jour. */
export function GET() {
  return NextResponse.json({ version: process.env.NEXT_PUBLIC_BUILD_VERSION ?? "local" }, { headers: { "Cache-Control": "no-store" } });
}
