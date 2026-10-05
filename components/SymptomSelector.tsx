"use client";

export const SYMPTOM_OPTIONS = ["Насморк", "Заложенность", "Чихание", "Зуд в глазах", "Слезятся глаза", "Кашель", "Зуд", "Покраснение"];

export function SymptomSelector({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
  function toggle(item: string) {
    if (value.includes(item)) return onChange(value.filter((symptom) => symptom !== item));
    onChange([...value, item]);
  }
  return <div className="tags">{SYMPTOM_OPTIONS.map((item) => <button type="button" className={`tag ${value.includes(item) ? "good" : ""}`} onClick={() => toggle(item)} key={item}>{item}</button>)}</div>;
}
