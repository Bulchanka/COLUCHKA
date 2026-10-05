"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function HistoryDatePicker({ defaultDate }: { defaultDate: string }) {
  const router = useRouter();
  const [date, setDate] = useState(defaultDate);
  return <div className="history-date-picker">
    <label>Дата пропущенной записи<input type="date" value={date} max={new Date().toISOString().slice(0, 10)} onChange={(event) => setDate(event.target.value)} /></label>
    <button className="button" onClick={() => router.push(`/patient/check-in?date=${date}`)} disabled={!date}>Добавить запись за этот день</button>
  </div>;
}
