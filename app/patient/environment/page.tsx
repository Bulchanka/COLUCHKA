import { getMedicalRecord } from "@/lib/store";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getDistrict } from "@/lib/location";
import { WeatherPanel } from "@/components/WeatherPanel";
import { RainMap } from "@/components/RainMap";

function pollenLevel(value: number | null) {
  if (value === null) return "нет данных";
  if (value <= 0) return "нет";
  if (value === 1) return "низкий";
  if (value === 2) return "умеренный";
  return "высокий";
}

export default function EnvironmentPage() {
  const { environment, checkIns, patient } = getMedicalRecord(getSession()!.id);
  const district = getDistrict(patient.district);
  const dates = ["29 сен", "30 сен", "1 окт", "2 окт", "3 окт", "4 окт", "5 окт"];
  const rows = [["Берёза", [1, 2, 2, 3, 3, 3, environment.birch]], ["Злаки", [0, 1, 1, 1, 2, 1, environment.grass]], ["Сорные травы", [1, 1, 2, 2, 2, 2, environment.weeds]]];
  const primaryAllergen = patient.allergens[0] ?? "Берёза";
  return <main className="main"><div className="page-heading"><div><div className="eyebrow">Внешний фон · {environment.city}</div><h1>Пыльца<br />по дням.</h1></div><span className="tag">{patient.location ? "Яндекс Погода + demo пыльца" : "данные demo"}</span></div>{patient.location && <section className="card" style={{ marginBottom: 18 }}><div className="section-head"><div><div className="eyebrow">Погода в выбранной точке</div><h2>{patient.location.address}</h2></div><span className="tag good">live</span></div><WeatherPanel lat={patient.location.lat} lon={patient.location.lon} /></section>}<section className="card soft"><div className="section-head"><div><h2>Пыльца по дням</h2><p className="muted" style={{ fontSize: 12 }}>Доступный синтетический snapshot для Москвы</p></div><span className="tag good">сегодня</span></div><div className="pollen-grid"><div className="label">Аллерген</div>{dates.map((date) => <div key={date} style={{ color: date === "5 окт" ? "var(--accent)" : "var(--muted)", fontWeight: 800 }}>{date}</div>)}{rows.flatMap(([name, values]) => [<div key={`${name}-label`} className="label">{name}</div>, ...(values as number[]).map((value, i) => <div key={`${name}-${i}`} title={`${name}, ${dates[i]}: уровень ${pollenLevel(value)}`}><span className={`pollen-dot ${value === 0 ? "none" : value === 1 ? "low" : value === 3 ? "high" : ""}`} /></div>)])}</div><div className="actions" style={{ marginTop: 20 }}><span className="tag good">низкий</span><span className="tag">умеренный</span><span className="tag alert">высокий</span><span className="tag" style={{ marginLeft: "auto" }}>● источник · demo snapshot</span></div></section><div className="grid grid-2" style={{ marginTop: 18 }}><section className="card"><div className="section-head"><div><div className="eyebrow">Вероятность осадков · {district.name}</div><h2>Погода по выбранной точке</h2></div><span style={{ fontSize: 26 }}>☔</span></div><RainMap lat={patient.location?.lat} lon={patient.location?.lon} fallback={district} /><p className="muted" style={{ fontSize: 13 }}>Значение берётся из Яндекс Погоды для выбранной точки. Если данных нет, используется demo snapshot района.</p></section><section className="card"><div className="section-head"><div><div className="eyebrow">Релевантность</div><h2>Что может влиять</h2></div><Link href="/patient/profile" className="tag">изменить район →</Link></div><p className="muted" style={{ fontSize: 13 }}>Аллергены: {patient.allergens.join(", ")}. Уровень пыльцы и качество воздуха — внешний контекст, а не объяснение симптомов.</p><div className="tags"><span className="tag alert">{primaryAllergen} · контекст</span><span className="tag good">Воздух · {environment.airQuality}</span><span className="tag">+{environment.temperature}°</span></div></section></div></main>;
}
