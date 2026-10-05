"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { MedicalRecord } from "@/lib/domain";

const normalize = (value: string) => value.toLocaleLowerCase("ru-RU").replaceAll("ё", "е");

export function DoctorDashboard({ records }: { records: MedicalRecord[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Все категории");
  const [sort, setSort] = useState<"name" | "score">("name");
  const [statsOpen, setStatsOpen] = useState(false);
  const [recipient, setRecipient] = useState("ALL");
  const [message, setMessage] = useState("Пожалуйста, заполните статистику самочувствия за текущую неделю.");
  const [notice, setNotice] = useState("");

  const categories = useMemo(() => Array.from(new Set(records.map((item) => item.patient.diagnosis))).sort((a, b) => normalize(a).localeCompare(normalize(b))), [records]);
  const filtered = useMemo(() => records
    .filter((record) => category === "Все категории" || record.patient.diagnosis === category)
    .filter((record) => {
      const haystack = normalize(`${record.patient.name} ${record.patient.omsPolicyNumber}`);
      return haystack.includes(normalize(query));
    })
    .sort((a, b) => sort === "name"
      ? normalize(a.patient.name).localeCompare(normalize(b.patient.name))
      : (b.checkIns[0]?.score ?? 0) - (a.checkIns[0]?.score ?? 0)), [records, query, category, sort]);

  const stats = useMemo(() => {
    const scores = records.flatMap((record) => record.checkIns.map((item) => item.score));
    const worsening = records.filter((record) => (record.checkIns[0]?.score ?? 0) < (record.checkIns.at(-1)?.score ?? 0)).length;
    const average = scores.reduce((sum, score) => sum + score, 0) / Math.max(1, scores.length);
    const byCategory = categories.map((name) => {
      const group = records.filter((record) => record.patient.diagnosis === name);
      const score = group.reduce((sum, record) => sum + (record.checkIns[0]?.score ?? 0), 0) / Math.max(1, group.length);
      return { name, count: group.length, score };
    });
    return { average, worsening, byCategory };
  }, [records, categories]);

  async function sendAnnouncement() {
    const response = await fetch("/api/announcements", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient, message, title: "Рекомендация к приёму" })
    });
    setNotice(response.ok ? "Рекомендация отправлена адресатам." : "Не удалось отправить рекомендацию.");
  }

  async function enablePush() {
    if (!("Notification" in window)) { setNotice("Браузер не поддерживает push-уведомления."); return; }
    const permission = await Notification.requestPermission();
    setNotice(permission === "granted" ? "Уведомления включены для сезона болезни." : "Разрешение на уведомления не выдано.");
    if (permission === "granted") new Notification("Колючка", { body: "Не забудьте собрать сезонную статистику." });
  }

  return <>
    <section className="card">
      <div className="section-head">
        <div><div className="eyebrow">Поиск по Mock EMIAS</div><h2>Пациенты врача</h2></div>
        <span className="tag good">{filtered.length} найдено</span>
      </div>
      <div className="toolbar">
        <input aria-label="Поиск пациента" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ФИО или номер полиса ОМС" />
        <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Категория болезни">
          <option>Все категории</option>{categories.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value as "name" | "score")} aria-label="Сортировка">
          <option value="name">По алфавиту</option><option value="score">По ухудшению</option>
        </select>
      </div>
      <div className="table-scroll"><table className="doctor-table"><thead><tr><th>Пациент</th><th>Полис ОМС</th><th>Категория болезни</th><th>Последняя отметка</th><th /></tr></thead><tbody>
        {filtered.map((record) => { const latest = record.checkIns[0]; return <tr key={record.patient.id}><td><b>{record.patient.name}</b><br /><span className="muted">{record.patient.age} лет · Москва</span></td><td><span className="mono">{record.patient.omsPolicyNumber}</span></td><td>{record.patient.diagnosis}<br /><span className="tag alert" style={{ marginTop: 5 }}>{record.patient.allergens[0]}</span></td><td><b>{latest?.score ?? "—"}/7</b><br /><span className="muted">{latest?.symptoms.join(", ") || "нет симптомов"}</span></td><td><Link className="button secondary" href={`/doctor/patients/${record.patient.id}`}>Открыть →</Link></td></tr>; })}
        {!filtered.length && <tr><td colSpan={5}><div className="empty-state">Пациенты по этому запросу не найдены.</div></td></tr>}
      </tbody></table></div>
    </section>

    <div className="grid grid-3" style={{ marginTop: 18 }}>
      <div className="card"><div className="eyebrow">Новые записи</div><div className="metric">{records.reduce((sum, record) => sum + record.checkIns.length, 0)}</div><div className="muted" style={{ fontSize: 12 }}>по закреплённым пациентам</div></div>
      <div className="card mint"><div className="eyebrow">Среднее состояние</div><div className="metric">{stats.average.toFixed(1)}</div><div className="muted" style={{ fontSize: 12 }}>из 7 · по всем записям</div></div>
      <div className="card peach"><div className="eyebrow">Есть ухудшение</div><div className="metric">{stats.worsening}</div><div className="muted" style={{ fontSize: 12 }}>пациентов требуют внимания</div></div>
    </div>

    <section className="card" style={{ marginTop: 18 }}>
      <div className="section-head"><div><div className="eyebrow">Сезон болезни</div><h2>Статистика и внимание</h2></div><span className="tag alert">октябрь 2026</span></div>
      <p className="muted">Собирайте check-in регулярно: график ухудшения помогает вовремя пригласить пациента на приём.</p>
      <div className="row wrap"><button className="button" onClick={() => setStatsOpen(true)}>Открыть общую статистику</button><button className="button secondary" onClick={enablePush}>Включить push-напоминания</button></div>
    </section>

    <section className="card" style={{ marginTop: 18 }}>
      <div className="section-head"><div><div className="eyebrow">Рекомендация к приёму</div><h2>Предупредить пользователей</h2></div><span className="tag">всплывающее окно</span></div>
      <div className="row wrap"><select value={recipient} onChange={(event) => setRecipient(event.target.value)} aria-label="Получатель"><option value="ALL">Все пациенты врача</option>{records.map((record) => <option value={record.patient.id} key={record.patient.id}>{record.patient.name}</option>)}</select><textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Текст рекомендации" /><button className="button" onClick={sendAnnouncement}>Отправить</button></div>
      {notice && <p className="muted" style={{ fontSize: 12 }}>{notice}</p>}
    </section>

    {statsOpen && <div className="modal-backdrop" role="dialog" aria-modal="true"><section className="modal card">
      <div className="section-head"><div><div className="eyebrow">Общая статистика</div><h2>Графики ухудшения</h2></div><button className="button ghost" onClick={() => setStatsOpen(false)}>Закрыть</button></div>
      <div className="category-bars">{stats.byCategory.map((item) => <div key={item.name}><div className="row"><b>{item.name}</b><span className="muted">{item.score.toFixed(1)}/7 · {item.count}</span></div><div className="bar"><span style={{ width: `${(item.score / 7) * 100}%` }} /></div></div>)}</div>
      <svg className="chart" viewBox="0 0 900 160" preserveAspectRatio="none"><line x1="0" y1="130" x2="900" y2="130" /><line x1="0" y1="80" x2="900" y2="80" /><polyline points="0,50 150,66 300,55 450,83 600,72 750,104 900,120" /></svg>
      <p className="muted">Линия показывает динамику среднего балла: ниже — хуже. Сортировка по категориям доступна в списке пациентов.</p>
    </section></div>}
  </>;
}
