import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { previewCheckInEdit, saveReviewedCheckInEdit } from "@/lib/store";
import { consumeAiReview, createAiReview } from "@/lib/reviews";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = getSession();
  if (session?.role !== "PATIENT") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await request.json();
  if (body.confirm) {
    const review = consumeAiReview(session.id, body.reviewId, "edit");
    if (!review || review.checkIn.id !== params.id) return NextResponse.json({ error: "review_expired", message: "Проверка истекла. Подготовьте правку ещё раз." }, { status: 409 });
    const checkIn = saveReviewedCheckInEdit(session.id, review.checkIn);
    return checkIn ? NextResponse.json({ checkIn }) : NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const input = { score: Math.min(7, Math.max(1, Number(body.score))), symptoms: Array.isArray(body.symptoms) ? body.symptoms : [], note: String(body.note ?? "") };
  const preview = await previewCheckInEdit(session.id, params.id, input);
  if (!preview) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (preview.safetyMessage) return NextResponse.json({ error: "out_of_scope", message: preview.safetyMessage }, { status: 400 });
  const checkIn = preview.checkIn;
  return NextResponse.json({ checkIn, preview: true, requiresConfirmation: true, provider: preview.aiProvider, reviewId: createAiReview(session.id, "edit", checkIn) });
}
