"use client";

import { useState } from "react";

type PhotoDraft = { label: string; dataUrl: string };

export function DoctorReportBuilder({ patientId }: { patientId: string }) {
  const [note, setNote] = useState("");
  const [photos, setPhotos] = useState<PhotoDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  function addPhotos(files: FileList | null) {
    Array.from(files ?? []).slice(0, 8 - photos.length).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        if (typeof dataUrl === "string") setPhotos((current) => current.length < 8 ? [...current, { label: file.name, dataUrl }] : current);
      };
      reader.readAsDataURL(file);
    });
  }

  async function createPdf() {
    setLoading(true);
    setNotice("");
    const response = await fetch("/api/reports/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId, note, photos })
    });
    if (!response.ok) {
      setNotice("Не удалось сформировать отчёт.");
      setLoading(false);
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `koluchka-${patientId}-report.pdf`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice("PDF-отчёт сформирован и скачан.");
    setLoading(false);
  }

  return <section className="card doctor-report-builder">
    <div className="section-head">
      <div><div className="eyebrow">Отчёт для врача</div><h2>Собрать PDF со статистикой</h2></div>
      <span className="tag good">данные пациента</span>
    </div>
    <p className="muted" style={{ fontSize: 13 }}>Добавьте комментарий и прикрепите фотографии наблюдений. В PDF попадут записи, назначения, внешний фон и вся статистика пациента.</p>
    <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Комментарий к отчёту или вопрос к следующему приёму" />
    <div className="report-upload-row">
      <label className="button secondary report-upload">
        📎 Прикрепить фото
        <input hidden type="file" accept="image/png,image/jpeg" multiple onChange={(event) => addPhotos(event.target.files)} />
      </label>
      <span className="muted" style={{ fontSize: 12 }}>{photos.length ? `Выбрано фото: ${photos.length}` : "до 8 изображений"}</span>
    </div>
    {photos.length > 0 && <div className="tags report-photo-list">{photos.map((photo, index) => <span className="tag good" key={`${photo.label}-${index}`}>{photo.label}<button type="button" onClick={() => setPhotos((current) => current.filter((_, itemIndex) => itemIndex !== index))}>×</button></span>)}</div>}
    <div className="actions" style={{ marginTop: 16 }}>
      <button className="button" onClick={createPdf} disabled={loading}>{loading ? "Готовим PDF…" : "Скачать PDF-отчёт"}</button>
      {notice && <span className="muted" style={{ fontSize: 12 }}>{notice}</span>}
    </div>
  </section>;
}
