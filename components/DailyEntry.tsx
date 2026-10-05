"use client";

import { useEffect, useState } from "react";
import { SymptomSelector } from "@/components/SymptomSelector";
import { VoiceButton } from "@/components/VoiceButton";

type Message = { role: "ai" | "me"; text: string };
export function DailyEntry({ initialDate }: { initialDate?: string }) {
  const [score, setScore] = useState(6);
  const [symptoms, setSymptoms] = useState<string[]>(["Насморк"]);
  const [note, setNote] = useState("");
  const [checkInSummary, setCheckInSummary] = useState("");
  const [checkInReviewId, setCheckInReviewId] = useState("");
  const [saved, setSaved] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "Можно написать или надиктовать, что было важно сегодня — я подготовлю запись." }
  ]);
  const [value, setValue] = useState("");
  const [assistantReviewId, setAssistantReviewId] = useState("");
  const [voiceStatus, setVoiceStatus] = useState("");
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [photoInput, setPhotoInput] = useState<HTMLInputElement | null>(null);
  const [attachedPhotos, setAttachedPhotos] = useState<Array<{ label: string; dataUrl: string }>>([]);
  const [photoNotice, setPhotoNotice] = useState("");
  const [eventDate, setEventDate] = useState(initialDate ?? "2026-10-05");

  useEffect(() => {
    if (initialDate) setEventDate(initialDate);
  }, [initialDate]);

  async function previewCheckIn() {
    const response = await fetch("/api/checkins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score, symptoms, note, eventDate, source: "WEB" })
    });
    const data = await response.json();
    setCheckInSummary(data.checkIn?.aiSummary ?? data.message ?? "Не удалось подготовить запись.");
    setCheckInReviewId(data.reviewId ?? "");
  }

  async function saveCheckIn() {
    if (!checkInReviewId) return;
    const response = await fetch("/api/checkins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: true, reviewId: checkInReviewId })
    });
    if (response.ok) {
      const data = await response.json();
      if (attachedPhotos.length && data.checkIn?.id) await uploadAttachedPhotos(data.checkIn.id);
      setSaved(true);
    }
  }

  async function sendAssistant(text = value) {
    if (!text.trim() || assistantLoading) return;
    setMessages((current) => [...current, { role: "me", text }]);
    setValue("");
    setAssistantLoading(true);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, eventDate })
      });
      const data = await response.json();
      const summary = data.response ?? data.checkIn?.aiSummary ?? "Я не могу обработать этот запрос вне безопасных границ дневника.";
      setMessages((current) => [...current, { role: "ai", text: summary }]);
      if (data.requiresConfirmation && data.reviewId) setAssistantReviewId(data.reviewId);
    } catch {
      setMessages((current) => [...current, { role: "ai", text: "Не удалось получить ответ. Попробуйте ещё раз." }]);
    } finally {
      setAssistantLoading(false);
    }
  }

  async function confirmAssistant() {
    if (!assistantReviewId) return;
    const response = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: true, reviewId: assistantReviewId })
    });
    if (response.ok) {
      const data = await response.json();
      if (attachedPhotos.length && data.checkIn?.id) await uploadAttachedPhotos(data.checkIn.id);
      setMessages((current) => [...current, { role: "ai", text: "Запись подтверждена и сохранена в общей медкарте." }]);
      setAssistantReviewId("");
    }
  }

  function attachPhotos(files: FileList | null) {
    const selected = Array.from(files ?? []).slice(0, 6 - attachedPhotos.length);
    if (!selected.length) return;
    setPhotoNotice("");
    selected.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setPhotoNotice("Можно прикрепить только изображения.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        if (typeof dataUrl === "string") {
          setAttachedPhotos((current) => current.length < 6 ? [...current, { label: file.name, dataUrl }] : current);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  async function uploadAttachedPhotos(checkInId: string) {
    if (!attachedPhotos.length) return;
    const response = await fetch("/api/photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photos: attachedPhotos, checkInId })
    });
    if (response.ok) {
      setPhotoNotice(`Прикреплено фото: ${attachedPhotos.length}. Они будут включены в отчёт врачу.`);
      setAttachedPhotos([]);
      if (photoInput) photoInput.value = "";
    } else {
      setPhotoNotice("Не удалось прикрепить фото. Попробуйте ещё раз.");
    }
  }

  if (saved) {
    return (
      <section className="card mint daily-entry">
        <div style={{ fontSize: 34 }}>✓</div>
        <h2>Запись сохранена</h2>
        <p className="muted">Она уже появилась в истории и будет видна врачу в общей медицинской карте.</p>
        <button className="button secondary" onClick={() => { setSaved(false); setCheckInSummary(""); setCheckInReviewId(""); }}>Добавить ещё одну</button>
      </section>
    );
  }

  return (
    <section className="card daily-entry">
      <div className="section-head daily-entry-heading">
        <div>
          <div className="eyebrow">Отметка и помощник</div>
          <h2>Расскажите, как вы себя чувствуете</h2>
        </div>
        <span className="tag good">одна запись</span>
      </div>
      <div className="daily-entry-grid">
        <section className="daily-entry-checkin">
          <div className="eyebrow">Быстрая отметка</div>
          <div className="range-wrap" style={{ justifyContent: "center", margin: "17px 0" }}>
            <input className="big-input" value={score} onChange={(event) => setScore(Number(event.target.value))} type="number" min="1" max="7" aria-label="Самочувствие от 1 до 7" />
            <span className="muted">из 7</span>
          </div>
          <input type="range" min="1" max="7" value={score} onChange={(event) => setScore(Number(event.target.value))} aria-label="Оценка самочувствия" />
          <div className="section-head" style={{ marginTop: 8 }}>
            <span className="muted" style={{ fontSize: 11 }}>тяжело</span>
            <span className="muted" style={{ fontSize: 11 }}>легко</span>
          </div>
          <label style={{ marginTop: 16 }}>Что вы заметили?<SymptomSelector value={symptoms} onChange={setSymptoms} /></label>
          <label style={{ marginTop: 16 }}>Комментарий<textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Что было важно сегодня?" /></label>
          {!checkInSummary ? (
            <button className="button full" onClick={previewCheckIn}>Проверить запись →</button>
          ) : (
            <div className="daily-entry-review">
              <div className="row"><b>Сводка записи</b><span className="tag">AI</span></div>
              <p>{checkInSummary}</p>
              <div className="actions">
                <button className="button" onClick={saveCheckIn} disabled={!checkInReviewId}>Сохранить</button>
                <button className="button ghost" onClick={() => { setCheckInSummary(""); setCheckInReviewId(""); }}>Исправить</button>
              </div>
            </div>
          )}
        </section>

        <section className="daily-entry-assistant">
          <div className="eyebrow">Помощник</div>
          <div className="chat daily-chat">
            {messages.map((message, index) => <div className={`bubble ${message.role === "me" ? "mine" : "ai"}`} key={`${message.text}-${index}`}>{message.text}</div>)}
            {assistantLoading && <div className="bubble ai typing-indicator" role="status" aria-label="Помощник печатает">
              <span /><span /><span />
            </div>}
          </div>
          {assistantReviewId && (
            <div className="daily-entry-review">
              <b>Подтвердить запись?</b>
              <p className="muted">Только после подтверждения она попадёт в историю.</p>
              <div className="actions">
                <button className="button" onClick={confirmAssistant}>Сохранить</button>
                <button className="button ghost" onClick={() => setAssistantReviewId("")}>Исправить</button>
              </div>
            </div>
          )}
          <div className="tags" style={{ margin: "16px 0 10px" }}>
            <button className="quick" onClick={() => sendAssistant("Самочувствие 6 из 7, есть насморк, кашля нет")}>Отметить текстом</button>
            <button className="quick" onClick={() => setValue("Самочувствие 5 из 7, заложенность утром")}>Шаблон</button>
          </div>
          <div className="chat-attachments">
            <label className="quick chat-photo-button">
              📷 Прикрепить фото
              <input ref={setPhotoInput} hidden type="file" accept="image/png,image/jpeg" multiple onChange={(event) => attachPhotos(event.target.files)} />
            </label>
            {attachedPhotos.length > 0 && <div className="chat-photo-list">
              {attachedPhotos.map((photo, index) => <span className="tag good" key={`${photo.label}-${index}`}>{photo.label}<button type="button" onClick={() => setAttachedPhotos((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Удалить ${photo.label}`}>×</button></span>)}
              <span className="photo-hint">Фото прикрепятся к записи после сохранения</span>
            </div>}
            {photoNotice && <p className="muted" style={{ fontSize: 11, margin: "8px 0 0" }}>{photoNotice}</p>}
          </div>
          <div className="row">
            <input value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => event.key === "Enter" && sendAssistant()} placeholder="Напишите, что было важно" />
            <VoiceButton onText={setValue} onStatus={setVoiceStatus} />
            <button className="button" onClick={() => sendAssistant()} disabled={assistantLoading} aria-label="Отправить сообщение">→</button>
          </div>
          {voiceStatus && <p className="muted" style={{ fontSize: 11 }}>{voiceStatus}</p>}
        </section>
      </div>
    </section>
  );
}


