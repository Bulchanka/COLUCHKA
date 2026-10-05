import { NextResponse } from "next/server";
import { createAnnouncement, getAnnouncementsForPatient } from "@/lib/store";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = getSession();
  if (session?.role !== "DOCTOR") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await request.json();
  const recipients = body.recipient === "ALL" ? "ALL" : [String(body.recipient)];
  if (!String(body.message ?? "").trim()) return NextResponse.json({ error: "message_required" }, { status: 400 });
  return NextResponse.json({
    announcement: createAnnouncement({
      title: String(body.title ?? "Рекомендация врача"),
      message: String(body.message),
      recipients,
      createdBy: session.displayName
    })
  });
}

export async function GET() {
  const session = getSession();
  if (session?.role !== "PATIENT") return NextResponse.json({ announcements: [] });
  return NextResponse.json({ announcements: getAnnouncementsForPatient(session.id) });
}
