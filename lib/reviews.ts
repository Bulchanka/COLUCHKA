import { CheckIn } from "./domain";

export type PendingAiReview = {
  id: string;
  patientId: string;
  kind: "create" | "edit";
  checkIn: CheckIn;
  expiresAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __koluchkaAiReviews: Record<string, PendingAiReview> | undefined;
}

function reviews() {
  if (!globalThis.__koluchkaAiReviews) globalThis.__koluchkaAiReviews = {};
  return globalThis.__koluchkaAiReviews;
}

export function createAiReview(patientId: string, kind: PendingAiReview["kind"], checkIn: CheckIn) {
  const id = crypto.randomUUID();
  reviews()[id] = { id, patientId, kind, checkIn, expiresAt: Date.now() + 15 * 60_000 };
  return id;
}

export function consumeAiReview(patientId: string, id: unknown, kind: PendingAiReview["kind"]) {
  const review = typeof id === "string" ? reviews()[id] : undefined;
  if (!review || review.patientId !== patientId || review.kind !== kind || review.expiresAt < Date.now()) return null;
  delete reviews()[review.id];
  return review;
}
