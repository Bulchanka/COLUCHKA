"use client";

import { useState } from "react";
import type { Photo } from "@/lib/domain";

export function PatientPhotoGallery({ photos }: { photos: Photo[] }) {
  const [items, setItems] = useState(photos);
  const [notice, setNotice] = useState("");

  async function detach(id: string) {
    const response = await fetch(`/api/photos?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (response.ok) {
      setItems((current) => current.filter((photo) => photo.id !== id));
      setNotice("Фото откреплено от записи.");
    } else setNotice("Не удалось открепить фото.");
  }

  if (!items.length) return <div className="status-pill">Пока нет прикреплённых фотографий.</div>;
  return <div className="patient-photo-gallery">
    {items.map((photo) => <figure key={photo.id}>
      {photo.dataUrl && <img src={photo.dataUrl} alt={photo.label} />}
      <figcaption>{photo.label}<small>Запись · {photo.checkInId}</small></figcaption>
      <button className="button ghost" type="button" onClick={() => detach(photo.id)}>Открепить фото</button>
    </figure>)}
    {notice && <p className="muted" style={{ fontSize: 12 }}>{notice}</p>}
  </div>;
}
