"use client";
import { useState } from "react";
import Link from "next/link";
import { SymptomSelector } from "@/components/SymptomSelector";

export function CheckInForm({ initialDate }: { initialDate?: string }) {
  const [score, setScore] = useState(6);
  const [symptoms, setSymptoms] = useState<string[]>(["Насморк"]);
  const [note, setNote] = useState("");
  const [summary, setSummary] = useState("");
  const [provider, setProvider] = useState("demo");
  const [reviewId, setReviewId] = useState("");
  const [saved, setSaved] = useState(false);
  const [eventDate, setEventDate] = useState(initialDate ?? new Date().toISOString().slice(0, 10));
  async function submit(confirm = false) {
    const response = await fetch("/api/checkins", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ score, symptoms, note, eventDate, source: "WEB", confirm }) });
    const data = await response.json();
    setSummary(data.checkIn?.aiSummary ?? data.message ?? "Не удалось подготовить запись. Измените формулировку и попробуйте снова.");
    setProvider(data.checkIn?.aiProvider ?? "demo");
    setReviewId(data.reviewId ?? "");
  }
  async function save() {
    if (!reviewId) return;
    const response = await fetch("/api/checkins", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirm: true, reviewId }) });
    if (response.ok) setSaved(true);
  }
  if (saved) return <section className="card mint" style={{ maxWidth: 700 }}><div style={{ fontSize: 40 }}>✓</div><h2 style={{ marginTop: 10 }}>Запись сохранена</h2><p className="muted">Она уже появилась в истории и будет видна врачу в общей медицинской карте.</p><div className="actions"><Link className="button" href="/patient/history">Открыть историю</Link><Link className="button secondary" href="/patient">На сегодня</Link></div></section>;
  return <div className="grid grid-2">
    <section className="card"><div className="eyebrow">Самочувствие</div><label className="date-field">Дата записи<input type="date" value={eventDate} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setEventDate(e.target.value)} /></label><div className="range-wrap" style={{ justifyContent: "center", margin: "23px 0" }}><input className="big-input" value={score} onChange={(e) => setScore(Number(e.target.value))} type="number" min="1" max="7" aria-label="Самочувствие от 1 до 7" /><span className="muted">из 7</span></div><input type="range" min="1" max="7" value={score} onChange={(e) => setScore(Number(e.target.value))} aria-label="Оценка самочувствия" /><div className="section-head" style={{ marginTop: 8 }}><span className="muted" style={{ fontSize: 11 }}>тяжело</span><span className="muted" style={{ fontSize: 11 }}>легко</span></div><label style={{ marginTop: 22 }}>Что вы заметили?<SymptomSelector value={symptoms} onChange={setSymptoms} /></label><label style={{ marginTop: 20 }}>Комментарий <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Что было важно сегодня?" /></label><button className="button full" onClick={() => submit()}>Проверить запись →</button></section>
    <section className="card soft"><div className="eyebrow">AI-проверка</div><h2 style={{ marginTop: 8 }}>Проверьте запись перед сохранением.</h2><p className="muted" style={{ fontSize: 13 }}>AI выделит только важные сведения о самочувствии. Запись попадёт в историю только после вашего подтверждения.</p>{summary ? <div className="card" style={{ marginTop: 22 }}><div className="row"><b>Сводка записи</b><span className="tag">AI · {provider}</span></div><p style={{ fontSize: 13 }}>{summary}</p><div className="actions"><button className="button" onClick={save} disabled={!reviewId}>Всё верно, сохранить</button><button className="button ghost" onClick={() => { setSummary(""); setReviewId(""); }}>Исправить</button></div></div> : <div className="status-pill" style={{ marginTop: 24 }}>После заполнения появится краткая сводка с сохранёнными отрицаниями и источником записи.</div>}</section>
  </div>;
}
