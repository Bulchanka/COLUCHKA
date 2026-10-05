"use client";

import { useState } from "react";

const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

const MAX_DATE = "2026-10-05";

export function PatientCalendar({ value, onChange }: { value: string; onChange: (date: string) => void }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState({ year: 2026, month: 9 });
  const { year, month } = view;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const selectedLabel = new Date(`${value}T12:00:00`).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
  const canGoNext = year < 2026 || (year === 2026 && month < 9);
  return <section className="patient-calendar">
    <button type="button" className="calendar-trigger" onClick={() => setOpen((current) => !current)} aria-expanded={open}>
      <span><span className="eyebrow">Дата записи</span><strong>{selectedLabel}</strong></span><span className="calendar-trigger-icon">⌄</span>
    </button>
    {open && <div className="calendar-popover" role="dialog" aria-label="Выбор даты записи">
      <div className="section-head">
        <button type="button" className="calendar-nav" onClick={() => setView((current) => current.month === 0 ? { year: current.year - 1, month: 11 } : { ...current, month: current.month - 1 })} aria-label="Предыдущий месяц">←</button>
        <h3>{monthNames[month]} {year}</h3>
        <button type="button" className="calendar-nav" disabled={!canGoNext} onClick={() => setView((current) => current.month === 11 ? { year: current.year + 1, month: 0 } : { ...current, month: current.month + 1 })} aria-label="Следующий месяц">→</button>
      </div>
      <div className="calendar-grid calendar-weekdays">{weekdays.map((day) => <span key={day}>{day}</span>)}</div>
      <div className="calendar-grid">
        {Array.from({ length: firstDay }, (_, index) => <span className="calendar-empty" key={`empty-${index}`} />)}
        {Array.from({ length: daysInMonth }, (_, index) => {
          const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`;
          const selected = date === value;
          const disabled = date > MAX_DATE;
          const isToday = date === MAX_DATE;
          return <button type="button" disabled={disabled} className={`calendar-day ${selected ? "selected" : ""} ${isToday ? "today" : ""}`} key={date} onClick={() => { onChange(date); setOpen(false); }} aria-pressed={selected}>{index + 1}</button>;
        })}
      </div>
      <p className="muted calendar-caption">Будущие даты недоступны для записей.</p>
    </div>}
  </section>;
}
