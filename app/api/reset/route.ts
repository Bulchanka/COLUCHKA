import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { resetMedicalRecord } from "@/lib/store";
export async function POST() {
  if (getSession()?.role !== "DOCTOR") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  return NextResponse.json(resetMedicalRecord());
}
