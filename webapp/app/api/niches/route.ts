import { NextResponse } from "next/server";
import { NICHES, FORMATS } from "@/lib/niches-data";

export const runtime = "edge";

export async function GET() {
  return NextResponse.json({
    niches: NICHES,
    formats: FORMATS,
    totals: {
      niches: NICHES.length,
      formats: FORMATS.length,
    },
  });
}
