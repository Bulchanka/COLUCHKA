import { NextResponse } from "next/server";
import { aiConfigured, verifyOpenAIConnection } from "@/lib/assistant";
import { getSession } from "@/lib/session";

export async function GET() {
  return NextResponse.json({
    configured: aiConfigured(),
    mode: process.env.OPENAI_MODE ?? "demo",
    provider: aiConfigured() ? "openai" : "demo",
    baseUrl: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
    model: process.env.OPENAI_MODEL?.trim() || "auto (первый доступный из /models)"
  });
}

export async function POST() {
  if (!getSession()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const result = await verifyOpenAIConnection();
  return NextResponse.json(result, { status: result.ok ? 200 : 503 });
}
