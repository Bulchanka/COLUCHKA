"use client";

import { useEffect, useState } from "react";

export function PatientAnnouncementPopup({ announcements }: { announcements: { id: string; title: string; message: string; createdAt: string; createdBy: string }[] }) {
  const [visible, setVisible] = useState(true);
  const [items, setItems] = useState(announcements);
  useEffect(() => {
    const timer = window.setInterval(async () => {
      const response = await fetch("/api/announcements", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setItems(data.announcements ?? []);
      }
    }, 15000);
    return () => window.clearInterval(timer);
  }, []);
  const item = items[0];
  if (!item || !visible) return null;
  return <div className="modal-backdrop announcement-backdrop"><section className="modal card announcement-modal">
    <div className="eyebrow">Важная рекомендация</div><h2>{item.title}</h2>
    <p>{item.message}</p><p className="muted" style={{ fontSize: 12 }}>Отправил: {item.createdBy}</p>
    <button className="button full" onClick={() => setVisible(false)}>Понятно</button>
  </section></div>;
}
