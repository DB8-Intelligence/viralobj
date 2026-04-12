import { NextRequest, NextResponse } from "next/server";
import { generatePackage } from "@/lib/generator";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.niche || !body.objects || !body.topic) {
      return NextResponse.json(
        { error: "Missing required fields: niche, objects, topic" },
        { status: 400 }
      );
    }

    const pkg = await generatePackage({
      niche: body.niche,
      objects: Array.isArray(body.objects) ? body.objects : [],
      topic: body.topic,
      tone: body.tone,
      duration: body.duration,
      lang: body.lang ?? "both",
      provider: body.provider ?? "auto",
    });

    return NextResponse.json({ package: pkg });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
