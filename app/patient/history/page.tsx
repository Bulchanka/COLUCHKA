import { getMedicalRecord } from "@/lib/store";
import { HistoryList } from "@/components/HistoryList";
import Link from "next/link";
import { getSession } from "@/lib/session";

export default function HistoryPage() {
  const record = getMedicalRecord(getSession()!.id);
  const chartItems = [...record.checkIns].sort((a, b) => new Date(a.eventTime).getTime() - new Date(b.eventTime).getTime()).slice(-7);
  const chartPoints = chartItems.map((item, index) => `${chartItems.length === 1 ? 220 : (index / (chartItems.length - 1)) * 440},${130 - ((item.score - 1) / 6) * 100}`).join(" ");
  return <main className="main"><div className="page-heading"><div><div className="eyebrow">История и графики</div><h1>Ваша динамика.</h1></div><Link href="/patient" className="button">← На главную</Link></div><section className="card history-chart-card"><div className="section-head"><div><div className="eyebrow">Последние 7 дней</div><h2>График состояния</h2></div><span className="tag">обновляется после сохранения</span></div><svg className="chart" viewBox="0 0 440 150" preserveAspectRatio="none"><line x1="0" y1="130" x2="440" y2="130" /><line x1="0" y1="80" x2="440" y2="80" /><line x1="0" y1="30" x2="440" y2="30" />{chartPoints && <polyline points={chartPoints} />}</svg><div className="row"><span className="muted" style={{ fontSize: 11 }}>{chartItems[0] ? new Date(chartItems[0].eventTime).toLocaleDateString("ru-RU", { day: "numeric", month: "short" }) : "нет данных"}</span><span className="muted" style={{ fontSize: 11 }}>{chartItems.at(-1) ? new Date(chartItems.at(-1)!.eventTime).toLocaleDateString("ru-RU", { day: "numeric", month: "short" }) : "нет данных"}</span></div></section><section style={{ marginTop: 22 }}><div className="section-head"><h2>Лента записей</h2><span className="muted" style={{ fontSize: 12 }}>Можно исправить запись после AI-проверки</span></div><HistoryList record={record} editable /></section></main>;
}
