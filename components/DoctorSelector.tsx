"use client";
import { Account } from "@/lib/domain";
import { useState } from "react";

export function DoctorSelector({ doctors, currentDoctorId, clinic }: { doctors: Account[]; currentDoctorId: string; clinic: string }) {
  const [selected, setSelected] = useState(currentDoctorId);
  const [notice, setNotice] = useState("");
  async function save() {
    const response = await fetch("/api/doctor-selection", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ doctorId: selected }) });
    setNotice(response.ok ? "Врач выбран. Он увидит ваши записи и статистику в общей медкарте." : "Этот врач недоступен в вашем пункте.");
  }
  return <section className="card" style={{ marginTop: 18 }}><div className="section-head"><div><div className="eyebrow">Ваш врач</div><h2>Выберите специалиста</h2></div><span className="tag">только {clinic}</span></div><select value={selected} onChange={(event) => setSelected(event.target.value)}>{doctors.map((doctor) => <option value={doctor.id} key={doctor.id}>{doctor.displayName} · {doctor.specialty}</option>)}</select><div className="actions" style={{ marginTop: 14 }}><button className="button" onClick={save}>Сохранить выбор</button>{notice && <span className="muted" style={{ fontSize: 12 }}>{notice}</span>}</div></section>;
}
