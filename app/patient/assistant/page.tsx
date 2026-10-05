"use client";

import { useState } from "react";
import { VoiceButton } from "@/components/VoiceButton";

export default function AssistantPage() {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Я структурирую только записи дневника: самочувствие по шкале 1–7, симптомы, назначения и вопросы к врачу." }
  ]);
  const [value, setValue] = useState("");
  const [preview, setPreview] = useState<{ score: number; reviewId: string } | null>(null);
  const [voiceStatus, setVoiceStatus] = useState("");

  async function send(text = value) {
    if (!text.trim()) return;
    setMessages((current) => [...current, { role: "me", text }]);
    setValue("");
    const response = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    const data = await response.json();
    const summary = data.response ?? data.checkIn?.aiSummary ?? "Я не могу обработать этот запрос вне безопасных границ дневника.";
    setMessages((current) => [...current, { role: "ai", text: summary }]);
    if (data.requiresConfirmation && data.reviewId) setPreview({ score: data.checkIn.score, reviewId: data.reviewId });
  }

  async function confirm() {
    if (!preview) return;
    const response = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: true, reviewId: preview.reviewId })
    });
    if (response.ok) {
      setMessages((current) => [...current, { role: "ai", text: "Запись подтверждена и сохранена в общей медкарте. Она видна в WEB и врачу." }]);
      setPreview(null);
    }
  }

  return (
    <main className="main">
      <div className="page-heading">
        <div><div className="eyebrow">Помощник и дневник</div><h1>Одна умная<br />точка входа.</h1></div>
        <span className="tag good">общая медкарта</span>
      </div>
      <div className="grid grid-2">
        <section className="card">
          <div className="chat">
            {messages.map((message, index) => <div className={`bubble ${message.role === "me" ? "mine" : "ai"}`} key={`${message.text}-${index}`}>{message.text}</div>)}
          </div>
          {preview && <div className="card soft" style={{ marginTop: 16 }}>
            <b>Подтвердить запись?</b><p className="muted" style={{ fontSize: 12 }}>Только после подтверждения она попадёт в историю.</p>
            <div className="actions"><button className="button" onClick={confirm}>Всё верно, сохранить</button><button className="button ghost" onClick={() => setPreview(null)}>Исправить</button></div>
          </div>}
          <div className="tags" style={{ margin: "22px 0 12px" }}>
            <button className="quick" onClick={() => send("Самочувствие 6 из 7, есть насморк, кашля нет")}>Отметить самочувствие</button>
            <button className="quick" onClick={() => setValue("Самочувствие 5 из 7, заложенность утром")}>Шаблон дневника</button>
          </div>
          <div className="row">
            <input value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => event.key === "Enter" && send()} placeholder="Напишите или скажите, что было важно" />
            <VoiceButton onText={setValue} onStatus={setVoiceStatus} />
            <button className="button" onClick={() => send()}>→</button>
          </div>
          {voiceStatus && <p className="muted" style={{ fontSize: 11 }}>{voiceStatus}</p>}
        </section>
        <section className="card soft">
          <div className="eyebrow">Личный помощник</div><h2 style={{ marginTop: 8 }}>Дневник всегда под рукой.</h2>
          <p className="muted" style={{ fontSize: 13 }}>Пишите или надиктуйте, что было важно. После проверки запись попадёт в ту же MedicalRecord и будет видна врачу.</p>
          <div className="status-pill" style={{ marginTop: 24 }}>AI выделяет только нужные аспекты: оценку 1–7, симптомы, назначения и вопросы к врачу.<br /><b style={{ color: "var(--ink)" }}>Yandex STT: live при настроенных ключах.</b></div>
        </section>
      </div>
    </main>
  );
}
