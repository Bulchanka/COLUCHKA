import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  if (getSession()?.role !== "PATIENT") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await request.json();
  return NextResponse.json({
    text: String(body.transcript ?? ""),
    provider: "yandex_stt",
    mode: process.env.YANDEX_STT_API_KEY ? "live_not_implemented" : "demo_fallback",
    isDemo: !process.env.YANDEX_STT_API_KEY
  });
}
