import { getMedicalRecord } from "@/lib/store";
import { HistoryList } from "@/components/HistoryList";
import Link from "next/link";
import { getSession } from "@/lib/session";

export default function HistoryPage() {
  const record = getMedicalRecord(getSession()!.id);
  return <main className="main"><div className="page-heading"><div><div className="eyebrow">История и графики</div><h1>Ваша динамика.</h1></div><Link href="/patient/check-in" className="button">+ Новая запись</Link></div><div className="grid grid-2"><section className="card"><div className="section-head"><div><div className="eyebrow">За последние 7 дней</div><h2>Самочувствие</h2></div><span className="tag good">стабильно</span></div><svg className="chart" viewBox="0 0 440 150" preserveAspectRatio="none"><line x1="0" y1="120" x2="440" y2="120" /><line x1="0" y1="75" x2="440" y2="75" /><line x1="0" y1="30" x2="440" y2="30" /><polyline points="0,92 65,65 130,82 195,45 260,58 325,36 400,50 440,30" /></svg><div className="row"><span className="muted" style={{ fontSize: 11 }}>29 сен</span><span className="muted" style={{ fontSize: 11 }}>5 окт</span></div></section><section className="card mint"><div className="eyebrow">Пропуски данных</div><div className="metric" style={{ marginTop: 10 }}>1 день</div><p className="muted" style={{ fontSize: 13 }}>За 7 дней не было отметки 1 октября. Это не оценка состояния — просто нет данных.</p><button className="button ghost">Понятно</button></section></div><section style={{ marginTop: 22 }}><div className="section-head"><h2>Лента записей</h2><span className="muted" style={{ fontSize: 12 }}>Можно исправить запись после AI-проверки</span></div><HistoryList record={record} editable /></section></main>;
}
