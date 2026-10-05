"use client";
import { useState } from "react";
import { ALLERGENS, MOSCOW_DISTRICTS } from "@/lib/location";

export function ProfileContextForm({ initialDistrict, initialAllergens }: { initialDistrict: string; initialAllergens: string[] }) {
  const [district, setDistrict] = useState(initialDistrict);
  const [allergens, setAllergens] = useState(initialAllergens);
  const [notice, setNotice] = useState("");
  function toggle(allergen: string) {
    setAllergens((current) => current.includes(allergen) ? current.filter((item) => item !== allergen) : [...current, allergen]);
  }
  async function save() {
    const response = await fetch("/api/profile-context", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ district, allergens }) });
    setNotice(response.ok ? "Контекст обновлён. Карта осадков и пыльца подстроены под выбранный район." : "Не удалось сохранить изменения.");
    if (response.ok) setTimeout(() => window.location.reload(), 700);
  }
  return <section className="card" style={{ marginTop: 18 }}><div className="section-head"><div><div className="eyebrow">Локация и аллергены</div><h2>Настройте внешний контекст</h2></div><span className="tag">Москва · demo</span></div><label>Ваш район<select value={district} onChange={(event) => setDistrict(event.target.value)}>{MOSCOW_DISTRICTS.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.map}</option>)}</select></label><label style={{ marginTop: 18 }}>Выберите релевантные аллергены<div className="tags">{ALLERGENS.map((allergen) => <button type="button" className={`tag ${allergens.includes(allergen) ? "good" : ""}`} key={allergen} onClick={() => toggle(allergen)}>{allergen}</button>)}</div></label><div className="actions" style={{ marginTop: 18 }}><button className="button" onClick={save}>Сохранить контекст</button>{notice && <span className="muted" style={{ fontSize: 12 }}>{notice}</span>}</div></section>;
}
