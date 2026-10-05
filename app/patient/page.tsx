import { getMedicalRecord } from "@/lib/store";
import { PatientDashboard } from "@/components/PatientDashboard";
import { getSession } from "@/lib/session";
export default function PatientPage() { return <PatientDashboard record={getMedicalRecord(getSession()!.id)} />; }
