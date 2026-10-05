"use client";

import { useEffect, useState } from "react";

type RainMapProps = { lat?: number; lon?: number; fallback: { rain: number; name: string; map: string; label: string } };
type Weather = { precipitationProbability?: number };

export function RainMap({ lat, lon, fallback }: RainMapProps) {
  const [rain, setRain] = useState(fallback.rain);
  const [source, setSource] = useState("demo snapshot");

  useEffect(() => {
    if (lat === undefined || lon === undefined) return;
    fetch(`/api/environment?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("weather unavailable")))
      .then((weather: Weather) => {
        if (typeof weather.precipitationProbability === "number") {
          setRain(weather.precipitationProbability);
          setSource("Яндекс Погода");
        }
      })
      .catch(() => undefined);
  }, [lat, lon]);

  const status = rain < 20 ? "осадки маловероятны" : rain < 50 ? "возможен небольшой дождь" : "дождь вероятен";
  return <div className="rain-map">
    <div className="rain-map-header"><span>{fallback.map}</span><b>{rain}%</b></div>
    <div className="rain-meter"><span style={{ width: `${Math.min(100, Math.max(0, rain))}%` }} /></div>
    <div className="rain-map-footer"><span>{status}</span><small>{source}</small></div>
  </div>;
}
