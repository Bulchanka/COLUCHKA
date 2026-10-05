"use client";
import { useState } from "react";
export default function PhotosPage() {
  const [files, setFiles] = useState<string[]>([]);
  return <main className="main"><div className="page-heading"><div><div className="eyebrow">Фото</div><h1>Наблюдения,<br />которые видно.</h1></div><span className="tag">привязаны к записи</span></div><section className="card"><div className="section-head"><div><h2>Добавить фото</h2><p className="muted" style={{ fontSize: 13 }}>Фото сохраняются вместе с выбранным check-in.</p></div><label className="button secondary" style={{ cursor: "pointer" }}>+ Выбрать<input hidden type="file" accept="image/*" multiple onChange={(e) => setFiles([...files, ...Array.from(e.target.files ?? []).map((file) => file.name)])} /></label></div>{files.length ? <div className="tags">{files.map((file) => <span className="tag" key={file}>{file} ×</span>)}</div> : <div className="status-pill">Пока нет фотографий. Добавьте снимок в черновик — здесь будет виден прогресс и статус сохранения.</div>}<button className="button" style={{ marginTop: 20 }} disabled={!files.length}>Сохранить фото</button></section></main>;
}
