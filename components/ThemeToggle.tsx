"use client";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.dataset.theme === "dark"); }, []);
  function toggle() {
    const next = !dark;
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("koluchka-theme", next ? "dark" : "light");
    setDark(next);
  }
  return <button className="theme-toggle" onClick={toggle} aria-label="Переключить тему">{dark ? "☀" : "◐"}</button>;
}
