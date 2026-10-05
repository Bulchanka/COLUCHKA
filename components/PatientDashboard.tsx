"use client";

import Link from "next/link";
import { MedicalRecord } from "@/lib/domain";
import { DailyEntry } from "@/components/DailyEntry";
import { PatientCalendar } from "@/components/PatientCalendar";
import { useState } from "react";

function pollenLevel(value: number | null) {
  if (value === null) return "нет данных";
  if (value <= 0) return "нет";
  if (value === 1) return "низкий";
  if (value === 2) return "умеренный";
  return "высокий";
}

export function PatientDashboard({ record }: { record: MedicalRecord }) {
  const latest = record.checkIns[0];
  const [selectedDate, setSelectedDate] = useState("2026-10-05");
  const chartItems = [...record.checkIns].sort((a, b) => new Date(a.eventTime).getTime() - new Date(b.eventTime).getTime()).slice(-7);
  const chartPoints = chartItems.map((item, index) => {
    const x = chartItems.length === 1 ? 220 : (index / (chartItems.length - 1)) * 440;
    const y = 130 - ((item.score - 1) / 6) * 100;
    return `${x},${y}`;
  }).join(" ");
  const chartStart = chartItems[0] ? new Date(chartItems[0].eventTime).toLocaleDateString("ru-RU", { day: "numeric", month: "short" }) : "нет данных";
  const chartEnd = chartItems.at(-1) ? new Date(chartItems.at(-1)!.eventTime).toLocaleDateString("ru-RU", { day: "numeric", month: "short" }) : "нет данных";
  return <main className="main">
    <div className="page-heading"><div><div className="eyebrow">{selectedDate === "2026-10-05" ? "Сегодня" : "Выбранная дата"} · {new Date(`${selectedDate}T12:00:00`).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}</div><h1>Как вы себя<br />чувствуете?</h1></div></div>
    <PatientCalendar value={selectedDate} onChange={setSelectedDate} />
    <DailyEntry initialDate={selectedDate} />
    <div className="grid grid-2">
      <section className="card hero-card"><div><div className="eyebrow">Последняя отметка</div><div className="hero-score">{latest.score}<span style={{ fontSize: 27, letterSpacing: 0 }}> / 7</span></div><div className="score-caption">Самочувствие {latest.score >= 6 ? "хорошее" : "требует внимания"}</div></div><div className="row"><span className="muted" style={{ fontSize: 12 }}>{latest.symptoms.join(" · ") || "Без симптомов"}</span><Link href="/patient/history" className="button secondary">Открыть историю →</Link></div></section>
      <section className="card mint"><div className="section-head"><div><div className="eyebrow">Внешний фон</div><h2>{record.environment.city}</h2></div><span style={{ fontSize: 24 }}>⌁</span></div><div className="row" style={{ margin: "25px 0 20px" }}><div><div className="metric">{record.environment.temperature}°</div><div className="muted" style={{ fontSize: 12 }}>ясно, воздух {record.environment.airQuality.toLowerCase()}</div></div><div style={{ textAlign: "right" }}><div className="metric pollen-level-word">{pollenLevel(record.environment.birch)}</div><div className="muted" style={{ fontSize: 12 }}>берёза · уровень</div></div></div><Link href="/patient/environment" className="button ghost">Посмотреть пыльцу →</Link></section>
    </div>
    <div className="grid grid-2" style={{ marginTop: 18 }}>
      <section className="card"><div className="section-head"><div><div className="eyebrow">Лечение</div><h2>{record.treatment.title}</h2></div><span className="tag good">{record.treatment.adherence}% выполнено</span></div><p className="muted" style={{ fontSize: 13 }}>{record.treatment.instruction}</p><div className="progress" style={{ margin: "20px 0 10px" }}><span style={{ width: `${record.treatment.adherence}%` }} /></div><div className="row"><span className="muted" style={{ fontSize: 12 }}>Ближайшее напоминание</span><b style={{ fontSize: 13 }}>{record.treatment.reminder}</b></div></section>
      <section className="card"><div className="section-head"><div><div className="eyebrow">Динамика</div><h2>Последние 7 дней</h2></div><span className="tag">самочувствие</span></div><svg className="chart" viewBox="0 0 440 150" preserveAspectRatio="none"><line x1="0" y1="130" x2="440" y2="130" /><line x1="0" y1="80" x2="440" y2="80" /><line x1="0" y1="30" x2="440" y2="30" />{chartPoints && <polyline points={chartPoints} />}</svg><div className="row"><span className="muted" style={{ fontSize: 11 }}>{chartStart}</span><span className="muted" style={{ fontSize: 11 }}>{chartEnd}</span></div></section>
    </div>
    <section className="card" style={{ marginTop: 18 }}><div className="section-head"><div><div className="eyebrow">Следующий контакт</div><h2>Подготовиться к приёму</h2></div><span style={{ fontSize: 22 }}>16.10</span></div><p className="muted" style={{ fontSize: 13 }}>Врач увидит историю симптомов, выполнение лечения и внешний фон в одной сводке.</p><Link className="button secondary" href="/patient/report">Посмотреть сводку для врача →</Link></section>
  </main>;
}
