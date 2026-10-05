"use client";
import { Medication } from "@/lib/domain";
import { useState } from "react";

export function MedicationList({ medications }: { medications: Medication[] }) {
  const [items, setItems] = useState(medications);
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  async function updateTaken(id: string, takenToday: boolean) {
    setBusyId(id);
    const response = await fetch("/api/medications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: takenToday ? "undo" : "taken", id })
    });
    const data = await response.json();
    if (data.medication) {
      setItems((current) => current.map((item) => item.id === id ? data.medication : item));
      setNotice(takenToday ? "Отметка о приёме отменена." : "Приём отмечен в дневнике выполнения.");
    }
    setBusyId(null);
  }
  return <>{items.map((medication) => <div className="card soft" style={{ padding: 15, marginTop: 10 }} key={medication.id}>
    <div className="row"><b>{medication.name}</b><span className="tag good">{medication.adherence}%</span></div>
    <p className="muted" style={{ fontSize: 12 }}>{medication.instruction}</p>
    <div className="row">
      <small className="muted">{medication.schedule} · {medication.prescribedBy}</small>
      <button
        className={`button ${medication.takenToday ? "undo" : "secondary"}`}
        onClick={() => updateTaken(medication.id, Boolean(medication.takenToday))}
        disabled={busyId === medication.id}
      >
        {busyId === medication.id ? "Сохраняем…" : medication.takenToday ? "Отменить отметку" : "Отметить приём"}
      </button>
    </div>
  </div>)}{notice && <p className="muted" style={{ fontSize: 12 }}>{notice}</p>}</>;
}
