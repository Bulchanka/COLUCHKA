import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { selectDoctor } from "@/lib/store";

export async function POST(request: Request) {
  const session = getSession();
  if (session?.role !== "PATIENT") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { doctorId } = await request.json();
  const record = selectDoctor(session.id, String(doctorId));
  return record ? NextResponse.json({ record }) : NextResponse.json({ error: "doctor_unavailable_at_clinic" }, { status: 400 });
}
