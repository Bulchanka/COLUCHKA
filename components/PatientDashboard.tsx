import Link from "next/link";
import { MedicalRecord } from "@/lib/domain";
import { DailyEntry } from "@/components/DailyEntry";

function weekDays() {
  const demoDate = new Date("2026-10-05T12:00:00+03:00");
  const monday = new Date(demoDate);
  monday.setDate(demoDate.getDate() - ((demoDate.getDay() + 6) % 7));
  return ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return { day, date: date.getDate(), selected: i === 0 };
  });
}

export function PatientDashboard({ record }: { record: MedicalRecord }) {
  const latest = record.checkIns[0];
  return <main className="main">
    <div className="page-heading"><div><div className="eyebrow">Сегодня · 5 октября 2026</div><h1>Как вы себя<br />чувствуете?</h1></div></div>
    <DailyEntry />
    <div className="card" style={{ marginBottom: 18 }}><div className="date-strip">{weekDays().map((item) => <div className={`day ${item.selected ? "selected" : ""}`} key={item.day}><span>{item.day}</span><strong>{item.date}</strong></div>)}</div></div>
    <div className="grid grid-2">
      <section className="card hero-card"><div><div className="eyebrow">Последняя отметка</div><div className="hero-score">{latest.score}<span style={{ fontSize: 27, letterSpacing: 0 }}> / 7</span></div><div className="score-caption">Самочувствие {latest.score >= 6 ? "хорошее" : "требует внимания"}</div></div><div className="row"><span className="muted" style={{ fontSize: 12 }}>{latest.symptoms.join(" · ") || "Без симптомов"}</span><Link href="/patient/history" className="button secondary">Открыть историю →</Link></div></section>
      <section className="card mint"><div className="section-head"><div><div className="eyebrow">Внешний фон</div><h2>{record.environment.city}</h2></div><span style={{ fontSize: 24 }}>⌁</span></div><div className="row" style={{ margin: "25px 0 20px" }}><div><div className="metric">{record.environment.temperature}°</div><div className="muted" style={{ fontSize: 12 }}>ясно, воздух {record.environment.airQuality.toLowerCase()}</div></div><div style={{ textAlign: "right" }}><div className="metric" style={{ color: "#bc765b" }}>{record.environment.birch}</div><div className="muted" style={{ fontSize: 12 }}>берёза · уровень</div></div></div><Link href="/patient/environment" className="button ghost">Посмотреть пыльцу →</Link></section>
    </div>
    <div className="grid grid-2" style={{ marginTop: 18 }}>
      <section className="card"><div className="section-head"><div><div className="eyebrow">Лечение</div><h2>{record.treatment.title}</h2></div><span className="tag good">{record.treatment.adherence}% выполнено</span></div><p className="muted" style={{ fontSize: 13 }}>{record.treatment.instruction}</p><div className="progress" style={{ margin: "20px 0 10px" }}><span style={{ width: `${record.treatment.adherence}%` }} /></div><div className="row"><span className="muted" style={{ fontSize: 12 }}>Ближайшее напоминание</span><b style={{ fontSize: 13 }}>{record.treatment.reminder}</b></div></section>
      <section className="card"><div className="section-head"><div><div className="eyebrow">Динамика</div><h2>Последние 7 дней</h2></div><span className="tag">самочувствие</span></div><svg className="chart" viewBox="0 0 440 150" preserveAspectRatio="none"><line x1="0" y1="120" x2="440" y2="120" /><line x1="0" y1="76" x2="440" y2="76" /><line x1="0" y1="32" x2="440" y2="32" /><polyline points="0,92 65,65 130,82 195,45 260,58 325,36 400,50 440,30" /></svg><div className="row"><span className="muted" style={{ fontSize: 11 }}>28 сен</span><span className="muted" style={{ fontSize: 11 }}>4 окт</span></div></section>
    </div>
    <section className="card" style={{ marginTop: 18 }}><div className="section-head"><div><div className="eyebrow">Следующий контакт</div><h2>Подготовиться к приёму</h2></div><span style={{ fontSize: 22 }}>16.10</span></div><p className="muted" style={{ fontSize: 13 }}>Врач увидит историю симптомов, выполнение лечения и внешний фон в одной сводке.</p><Link className="button secondary" href="/patient/report">Посмотреть сводку для врача →</Link></section>
  </main>;
}
