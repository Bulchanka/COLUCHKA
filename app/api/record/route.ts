import { NextResponse } from "next/server";
import { getMedicalRecord } from "@/lib/store";
import { getSession } from "@/lib/session";
export async function GET() {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(getMedicalRecord(session.role === "PATIENT" ? session.id : "anna"));
}
