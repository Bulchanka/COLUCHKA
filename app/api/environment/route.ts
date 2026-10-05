import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json({ error: "Некорректные координаты" }, { status: 400 });
  }
  const key = process.env.YANDEX_WEATHER_API_KEY;
  if (!key) return NextResponse.json({ error: "Не настроен ключ Яндекс Погоды" }, { status: 503 });
  try {
    const response = await fetch(`https://api.weather.yandex.ru/v2/forecast?lat=${lat}&lon=${lon}&limit=1&hours=false&lang=ru_RU`, {
      headers: { "X-Yandex-API-Key": key },
      cache: "no-store"
    });
    if (!response.ok) return NextResponse.json({ error: `Яндекс Погода вернула ошибку ${response.status}` }, { status: response.status });
    const data = await response.json();
    const fact = data.fact ?? {};
    const today = data.forecast?.parts?.find((part: { part_name?: string }) => part.part_name === "day") ?? data.forecast?.parts?.[0] ?? {};
    return NextResponse.json({
      temperature: fact.temp ?? 0,
      feelsLike: fact.feels_like,
      condition: fact.condition ?? "нет данных",
      humidity: fact.humidity,
      windSpeed: fact.wind_speed,
      precipitationProbability: today.prec_prob,
      source: "yandex_weather"
    });
  } catch {
    return NextResponse.json({ error: "Не удалось связаться с Яндекс Погодой" }, { status: 502 });
  }
}
