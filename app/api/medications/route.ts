import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { addMedication, toggleMedication, undoMedication } from "@/lib/store";
import { BDE } from "@/lib/domain";

export async function GET(request: Request) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const patientId = new URL(request.url).searchParams.get("patientId") ?? (session.role === "PATIENT" ? session.id : "");
  if (!patientId) return NextResponse.json({ medications: [] });
  if (session.role === "PATIENT" && patientId !== session.id) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (session.role === "DOCTOR" && !BDE.patients.some((patient) => patient.id === patientId && patient.assignedDoctorId === session.id)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return NextResponse.json({ medications: BDE.medications.filter((medication) => medication.patientId === patientId), source: "MOCK_EMIAS" });
}

export async function POST(request: Request) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json();
  if (body.action === "taken" || body.action === "undo") {
    const patientId = session.role === "PATIENT" ? session.id : String(body.patientId);
    const medication = body.action === "undo"
      ? undoMedication(patientId, String(body.id))
      : toggleMedication(patientId, String(body.id));
    return medication ? NextResponse.json({ medication }) : NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (session.role !== "DOCTOR") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const patientId = String(body.patientId);
  const record = (await import("@/lib/store")).getMedicalRecord(patientId);
  if (record.patient.assignedDoctorId !== session.id) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const medication = addMedication(patientId, {
    name: String(body.name), form: String(body.form ?? "препарат"), instruction: String(body.instruction),
    schedule: String(body.schedule), active: true, prescribedBy: session.displayName
  });
  return NextResponse.json({ medication });
}
