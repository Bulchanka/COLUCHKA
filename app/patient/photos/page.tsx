import { getMedicalRecord } from "@/lib/store";
import { getSession } from "@/lib/session";
import { PatientPhotoGallery } from "@/components/PatientPhotoGallery";
export default function PhotosPage() {
  const record = getMedicalRecord(getSession()!.id);
  return <main className="main"><div className="page-heading"><div><div className="eyebrow">Фото</div><h1>Наблюдения,<br />которые видно.</h1></div><span className="tag">привязаны к записи</span></div><section className="card"><div className="section-head"><div><h2>Фото в медицинской записи</h2><p className="muted" style={{ fontSize: 13 }}>Каждое фото связано с конкретным check-in и попадает в отчёт врачу.</p></div><span className="tag good">{record.photos.length} фото</span></div><PatientPhotoGallery photos={record.photos} /></section></main>;
}
