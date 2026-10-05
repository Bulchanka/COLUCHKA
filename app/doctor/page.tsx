import { getSession } from "@/lib/session";
import { getRecordsForDoctor } from "@/lib/store";
import { DoctorDashboard } from "@/components/DoctorDashboard";

export default function DoctorPage() {
  const doctor = getSession()!;
  const records = getRecordsForDoctor(doctor.id);
  return <main className="main"><div className="page-heading"><div><div className="eyebrow">{doctor.clinic}</div><h1>Пациенты<br />и статистика.</h1></div><span className="tag good">{records.length} пациентов доступны</span></div><DoctorDashboard records={records} /></main>;
}
