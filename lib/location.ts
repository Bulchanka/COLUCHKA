export const MOSCOW_DISTRICTS = [
  { id: "arbat", name: "Арбат", rain: 12, label: "без осадков", map: "ЦАО" },
  { id: "tverskoy", name: "Тверской", rain: 18, label: "местами небольшой дождь", map: "ЦАО" },
  { id: "marina-roshcha", name: "Марьина Роща", rain: 42, label: "небольшой дождь", map: "СВАО" },
  { id: "yasenevo", name: "Ясенево", rain: 67, label: "дождь вероятен", map: "ЮЗАО" },
  { id: "krylatskoye", name: "Крылатское", rain: 31, label: "облачно, без осадков", map: "ЗАО" }
] as const;

export const ALLERGENS = ["Берёза", "Злаки", "Сорные травы", "Домашняя пыль", "Кошка", "Собака"] as const;

export function getDistrict(id: string) {
  return MOSCOW_DISTRICTS.find((district) => district.id === id) ?? MOSCOW_DISTRICTS[0];
}
