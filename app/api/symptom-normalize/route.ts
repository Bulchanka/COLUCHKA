import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { normalizePatientText } from "@/lib/symptom-normalizer";

/**
 * Отдельный endpoint словаря. Его можно использовать независимо от провайдера
 * LLM — для UI, STT и будущих интеграций.
 */
export async function POST(request: Request) {
  const session = getSession();
  if (session?.role !== "PATIENT") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await request.json();
  const text = String(body.text ?? "");
  if (!text.trim()) return NextResponse.json({ error: "text_required" }, { status: 400 });

  return NextResponse.json(normalizePatientText(text));
}

