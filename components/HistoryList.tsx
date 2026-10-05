"use client";
import { useState } from "react";
import { MedicalRecord } from "@/lib/domain";
import { SymptomSelector } from "@/components/SymptomSelector";

export function HistoryList({ record, editable = false }: { record: MedicalRecord; editable?: boolean }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ score: 5, note: "", symptoms: [] as string[] });
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState<{ checkIn: MedicalRecord["checkIns"][number]; reviewId: string } | null>(null);
  function open(item: MedicalRecord["checkIns"][number]) {
    setEditingId(item.id);
    setDraft({ score: item.score, note: item.note, symptoms: item.symptoms });
  }
  async function save() {
    if (!editingId) return;
    const response = await fetch(`/api/checkins/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ score: draft.score, note: draft.note, symptoms: draft.symptoms }) });
    const data = await response.json();
    if (data.checkIn && data.reviewId) { setPending({ checkIn: data.checkIn, reviewId: data.reviewId }); setNotice(`AI проверил правку: ${data.checkIn.aiSummary}`); }
  }
  async function confirmEdit() {
    if (!pending) return;
    const response = await fetch(`/api/checkins/${pending.checkIn.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirm: true, reviewId: pending.reviewId }) });
    if (response.ok) { setPending(null); setEditingId(null); window.location.reload(); }
  }
  return <div className="timeline">{notice && !pending && <div className="status-pill">{notice}</div>}{pending && <div className="card ai-review-card"><div className="eyebrow">AI-проверка исправления</div><h3>Вот как нейронка поняла новую запись</h3><p>{pending.checkIn.aiSummary ?? "Сводка подготовлена на основе новой оценки, симптомов и комментария."}</p><div className="tags"><span className="tag good">Самочувствие · {pending.checkIn.score}/7</span>{pending.checkIn.symptoms.map((symptom) => <span className="tag" key={symptom}>{symptom}</span>)}</div><div className="actions" style={{ marginTop: 14 }}><button className="button" onClick={confirmEdit}>Подтвердить правку</button><button className="button ghost" onClick={() => setPending(null)}>Исправить ещё</button></div></div>}{record.checkIns.map((item) => <article className="timeline-item" key={item.id}><div className="timeline-dot" /><div className="card" style={{ padding: 17 }}><div className="row"><div><b>{new Date(item.eventTime).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}</b><span className="source" style={{ marginLeft: 10 }}>вы отметили в приложении</span></div><span className="metric" style={{ fontSize: 22, color: item.score < 6 ? "#cb7657" : "var(--accent)" }}>{item.score}<small style={{ fontSize: 12, color: "var(--muted)" }}>/7</small></span></div>{editingId === item.id ? <div className="form" style={{ marginTop: 14 }}><label>Самочувствие (1–7)<input type="number" min="1" max="7" value={draft.score} onChange={(e) => setDraft({ ...draft, score: Number(e.target.value) })} /></label><label>Что вы заметили?<SymptomSelector value={draft.symptoms} onChange={(symptoms) => setDraft({ ...draft, symptoms })} /></label><label>Комментарий<textarea value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} /></label><div className="actions"><button className="button" onClick={save}>Проверить AI и сохранить</button><button className="button ghost" onClick={() => setEditingId(null)}>Отмена</button></div></div> : <><div className="tags" style={{ marginTop: 12 }}>{item.symptoms.map((symptom) => <span className="tag" key={symptom}>{symptom}</span>)}</div>{item.note && <p style={{ fontSize: 13, marginBottom: 0 }}>{item.note}</p>}<div className="row" style={{ marginTop: 12 }}><span className="source">{item.aiSummary ? "AI-сводка подтверждена · " : ""}data_quality: patient_reported{item.updatedAt ? " · отредактировано" : ""}</span>{editable && <button className="button ghost" onClick={() => open(item)}>Изменить</button>}</div></>}</div></article>)}</div>;
}
