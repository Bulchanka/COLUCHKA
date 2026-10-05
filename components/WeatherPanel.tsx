"use client";

import { useEffect, useState } from "react";

type Weather = { temperature: number; feelsLike?: number; condition: string; humidity?: number; windSpeed?: number; precipitationProbability?: number };

export function WeatherPanel({ lat, lon }: { lat: number; lon: number }) {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setWeather(null);
    setError("");
    fetch(`/api/environment?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? "Погода недоступна");
        return body;
      })
      .then(setWeather)
      .catch((reason: Error) => setError(reason.message));
  }, [lat, lon]);

  if (error) return <p className="muted">{error}</p>;
  if (!weather) return <p className="muted">Загружаем погоду…</p>;
  return <div className="weather-panel">
    <div className="weather-temp">{weather.temperature > 0 ? "+" : ""}{weather.temperature}°</div>
    <div><b>{weather.condition}</b><div className="muted" style={{ fontSize: 12 }}>Ощущается как {weather.feelsLike ?? weather.temperature}°</div></div>
    <div className="weather-details">
      <span>Влажность · {weather.humidity ?? "—"}%</span>
      <span>Ветер · {weather.windSpeed ?? "—"} м/с</span>
      <span>Осадки · {weather.precipitationProbability ?? "—"}%</span>
    </div>
  </div>;
}
