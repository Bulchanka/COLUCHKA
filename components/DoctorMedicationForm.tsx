"use client";
import { useState } from "react";

export function DoctorMedicationForm({ patientId }: { patientId: string }) {
  const [name, setName] = useState("");
  const [notice, setNotice] = useState("");
  async function save() {
    const response = await fetch("/api/medications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ patientId, name, form: "препарат", instruction: "По схеме врача", schedule: "По назначению" }) });
    if (response.ok) { setNotice("Назначение добавлено в общую медкарту."); setName(""); }
  }
  return <section className="card" style={{ marginTop: 18 }}><div className="section-head"><div><div className="eyebrow">Новое назначение</div><h2>Добавить препарат</h2></div><span className="tag">только врач</span></div><div className="row"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Название препарата" /><button className="button" disabled={!name.trim()} onClick={save}>Добавить</button></div>{notice && <p className="muted" style={{ fontSize: 12 }}>{notice}</p>}</section>;
}
