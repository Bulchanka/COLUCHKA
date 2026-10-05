import { NextResponse } from "next/server";
import { previewCheckIn, saveReviewedCheckIn } from "@/lib/store";
import { getSession } from "@/lib/session";
import { consumeAiReview, createAiReview } from "@/lib/reviews";

export async function POST(request: Request) {
  const session = getSession();
  if (session?.role !== "PATIENT") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await request.json();
  if (typeof body.score !== "number" || !Array.isArray(body.symptoms)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  if (body.confirm) {
    const review = consumeAiReview(session.id, body.reviewId, "create");
    if (!review) return NextResponse.json({ error: "review_expired", message: "Проверка истекла. Подготовьте запись ещё раз." }, { status: 409 });
    return NextResponse.json({ checkIn: saveReviewedCheckIn(session.id, review.checkIn) });
  }
  const input = { score: Math.min(7, Math.max(1, body.score)), symptoms: body.symptoms, note: String(body.note ?? ""), source: "WEB" as const };
  const preview = await previewCheckIn(session.id, input);
  if (preview.safetyMessage) return NextResponse.json({ error: "out_of_scope", message: preview.safetyMessage, checkIn: null }, { status: 400 });
  const { safetyMessage: _safetyMessage, aiProvider, ...checkIn } = preview;
  return NextResponse.json({ checkIn: { ...checkIn, aiProvider }, reviewId: createAiReview(session.id, "create", checkIn), requiresConfirmation: true });
}
