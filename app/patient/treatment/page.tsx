import { getMedicalRecord } from "@/lib/store";
import { getSession } from "@/lib/session";
import { MedicationList } from "@/components/MedicationList";

export default function TreatmentPage() {
  const record = getMedicalRecord(getSession()!.id);
  const monthStartOffset = (new Date("2026-10-01T12:00:00+03:00").getDay() + 6) % 7;
  return <main className="main"><div className="page-heading"><div><div className="eyebrow">Лечение и календарь</div><h1>План,<br />который рядом.</h1></div><span className="tag good">назначено врачом</span></div><div className="grid grid-2"><section className="card"><div className="section-head"><div><div className="eyebrow">Назначения</div><h2>Активные препараты</h2></div><span className="tag">{record.medications.length}</span></div><MedicationList medications={record.medications} /></section><section className="card soft"><div className="eyebrow">Октябрь 2026</div><div className="pollen-grid" style={{ gridTemplateColumns: "repeat(7, 1fr)", marginTop: 20 }}>{["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map((x) => <div key={x} className="source">{x}</div>)}{Array.from({ length: monthStartOffset }, (_, i) => <div key={`empty-${i}`} aria-hidden="true" />)}{Array.from({ length: 31 }, (_, i) => <div key={i} style={{ borderRadius: 10, background: i === 4 ? "var(--accent)" : i % 5 === 0 ? "var(--mint)" : "#fff", color: i === 4 ? "#fff" : "var(--ink)", minHeight: 30 }}>{i + 1}</div>)}</div></section></div><section className="card" style={{ marginTop: 18 }}><div className="section-head"><h2>Как читать назначения</h2><span className="tag">общий план</span></div><p className="muted" style={{ fontSize: 13 }}>Самоотметка выполнения не меняет назначение врача. Если схема вызывает вопросы, добавьте их помощнику или обсудите на приёме.</p></section></main>;
}
