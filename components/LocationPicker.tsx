"use client";

import { useEffect, useRef, useState } from "react";

type LocationValue = { address: string; lat: number; lon: number };
type MapInstance = {
  events: { add: (name: string, handler: (event: { get: (key: string) => number[] }) => void) => void };
  destroy: () => void;
  setCenter: (coordinates: number[], zoom?: number) => void;
  geoObjects: { add: (object: unknown) => void; remove: (object: unknown) => void };
};
type YMaps = {
  Map: new (element: HTMLElement, options: Record<string, unknown>) => MapInstance;
  Placemark: new (coordinates: number[], properties?: Record<string, unknown>, options?: Record<string, unknown>) => unknown;
  geocode: (query: number[] | string) => Promise<{ geoObjects: { get: (index: number) => { properties: { get: (key: string) => string }; geometry?: { getCoordinates: () => number[] } } } }>;
};

declare global {
  interface Window { ymaps?: { ready: (callback: () => void) => void } }
}

const DEFAULT_LOCATION: LocationValue = { address: "Москва", lat: 55.751244, lon: 37.618423 };

export function LocationPicker({ value, onChange }: { value?: LocationValue; onChange: (value: LocationValue) => void }) {
  const mapNode = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapInstance | null>(null);
  const apiRef = useRef<YMaps | null>(null);
  const markerRef = useRef<unknown>(null);
  const [query, setQuery] = useState(value?.address ?? "");
  const selected = value ?? DEFAULT_LOCATION;

  useEffect(() => {
    const scriptId = "yandex-maps-api";
    const start = () => window.ymaps?.ready(() => {
      if (!mapNode.current || mapRef.current) return;
      const api = window.ymaps as unknown as YMaps;
      apiRef.current = api;
      const map = new api.Map(mapNode.current, { center: [selected.lat, selected.lon], zoom: 11, controls: ["zoomControl"] });
      mapRef.current = map;

      const setPoint = async (coordinates: number[]) => {
        const [lat, lon] = coordinates;
        if (markerRef.current) map.geoObjects.remove(markerRef.current);
        markerRef.current = new api.Placemark(coordinates, {}, { preset: "islands#greenDotIcon" });
        map.geoObjects.add(markerRef.current);
        let address = `Точка ${lat.toFixed(5)}, ${lon.toFixed(5)}`;
        try {
          const result = await api.geocode(coordinates);
          address = result.geoObjects.get(0)?.properties.get("text") ?? address;
        } catch {}
        setQuery(address);
        onChange({ address, lat, lon });
      };

      map.events.add("click", (event) => { void setPoint(event.get("coords")); });
      void setPoint([selected.lat, selected.lon]);
    });

    if (window.ymaps) start();
    else {
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY ?? "")}&lang=ru_RU`;
        script.onload = start;
        document.head.appendChild(script);
      } else script.addEventListener("load", start);
    }
    return () => { mapRef.current?.destroy(); mapRef.current = null; };
  // The map is initialized once; selected is only its initial center.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function search() {
    if (!query.trim() || !window.ymaps) return;
    const api = window.ymaps as unknown as YMaps;
    const result = await api.geocode(query);
    const first = result.geoObjects.get(0);
    const coordinates = first?.geometry?.getCoordinates();
    if (!coordinates) return;
    const address = first.properties.get("text") || query;
    if (mapRef.current && apiRef.current) {
      if (markerRef.current) mapRef.current.geoObjects.remove(markerRef.current);
      markerRef.current = new apiRef.current.Placemark(coordinates, {}, { preset: "islands#greenDotIcon" });
      mapRef.current.geoObjects.add(markerRef.current);
      mapRef.current.setCenter(coordinates, 14);
    }
    setQuery(address);
    onChange({ address, lat: coordinates[0], lon: coordinates[1] });
  }

  function locate() {
    navigator.geolocation?.getCurrentPosition((position) => {
      const next = { address: "Моё местоположение", lat: position.coords.latitude, lon: position.coords.longitude };
      const coordinates = [next.lat, next.lon];
      if (mapRef.current && apiRef.current) {
        if (markerRef.current) mapRef.current.geoObjects.remove(markerRef.current);
        markerRef.current = new apiRef.current.Placemark(coordinates, {}, { preset: "islands#greenDotIcon" });
        mapRef.current.geoObjects.add(markerRef.current);
        mapRef.current.setCenter(coordinates, 14);
      }
      setQuery(next.address);
      onChange(next);
    });
  }

  return <div className="location-picker">
    <div className="location-search">
      <input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void search(); }} placeholder="Введите адрес или район" />
      <button type="button" className="button secondary" onClick={() => void search()}>Найти</button>
      <button type="button" className="button ghost" onClick={locate}>Моя геопозиция</button>
    </div>
    <div ref={mapNode} className="yandex-map" />
    <div className="muted location-caption">Нажмите на карту, чтобы выбрать место. Сейчас: {selected.address}</div>
  </div>;
}
