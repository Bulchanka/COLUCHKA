import { NextResponse } from "next/server";
import { previewCheckInFromDecision, saveReviewedCheckIn } from "@/lib/store";
import { getSession } from "@/lib/session";
import { processAssistantInput } from "@/lib/assistant";
import { consumeAiReview, createAiReview } from "@/lib/reviews";

export async function POST(request: Request) {
  const session = getSession();
  if (session?.role !== "PATIENT") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await request.json();
  if (body.confirm) {
    const review = consumeAiReview(session.id, body.reviewId, "create");
    if (!review) return NextResponse.json({ error: "review_expired", message: "Проверка истекла. Отправьте сообщение ещё раз." }, { status: 409 });
    return NextResponse.json({ checkIn: saveReviewedCheckIn(session.id, review.checkIn) });
  }

  const text = String(body.text ?? "");
  const result = await processAssistantInput(text);
  if (result.shouldCreateCheckIn && !result.safetyMessage) {
    const preview = previewCheckInFromDecision(
      session.id,
      { score: result.score, symptoms: result.symptoms, note: text, source: "WEB" },
      result
    );
    const { safetyMessage: _safetyMessage, aiProvider, ...checkIn } = preview;
    return NextResponse.json({
      checkIn: { ...checkIn, aiProvider, relevantAspects: result.relevantAspects },
      safetyMessage: null,
      response: result.response,
      normalization: result.normalization,
      provider: result.provider,
      reviewId: createAiReview(session.id, "create", checkIn),
      requiresConfirmation: true
    });
  }

  return NextResponse.json({
    checkIn: { score: result.score, symptoms: result.symptoms, note: text, aiSummary: result.summary, relevantAspects: result.relevantAspects },
    safetyMessage: result.safetyMessage,
    response: result.response,
    normalization: result.normalization,
    provider: result.provider,
    requiresConfirmation: result.shouldCreateCheckIn
  });
}
