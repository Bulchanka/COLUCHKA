import { getMedicalRecord } from "@/lib/store";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { ProfileContextForm } from "@/components/ProfileContextForm";

export default function ProfilePage() {
  const record = getMedicalRecord(getSession()!.id);
  const { patient } = record;
  return <main className="main"><div className="page-heading"><div><div className="eyebrow">Профиль</div><h1>Ваш контекст.</h1></div><span className="tag">demo-профиль</span></div><div className="grid grid-2"><section className="card"><div className="section-head"><h2>{patient.name}</h2><span className="avatar">{patient.name.split(" ").map((item) => item[0]).join("")}</span></div><div className="row" style={{ padding: "15px 0", borderBottom: "1px solid var(--line)" }}><span className="muted">Возраст</span><b>{patient.age} лет</b></div><div className="row" style={{ padding: "15px 0", borderBottom: "1px solid var(--line)" }}><span className="muted">Пункт</span><b>{patient.clinic}</b></div><div className="row" style={{ padding: "15px 0", borderBottom: "1px solid var(--line)" }}><span className="muted">Аллергены</span><span className="tag alert">{patient.allergens.join(", ")}</span></div><div className="row" style={{ padding: "15px 0" }}><span className="muted">Реакция</span><span>{patient.allergyReaction}</span></div></section><section className="card mint"><div className="eyebrow">Диагноз из медкарты</div><h2 style={{ marginTop: 10 }}>{patient.diagnosis}</h2><p className="muted" style={{ fontSize: 12 }}>Источник: MockEmiasDatabase · integration_mode: demo</p><Link href="/patient/report" className="button ghost">Подготовка к приёму →</Link></section></div><ProfileContextForm initialDistrict={patient.district} initialAllergens={patient.allergens} initialLocation={patient.location} /></main>;
}
