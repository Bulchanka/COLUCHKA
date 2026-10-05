import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/session";

const patientLinks = [
  ["⌂", "Главное", "/patient"],
  ["◌", "Пыльца", "/patient/environment"],
  ["▣", "История", "/patient/history"],
  ["◒", "Лечение", "/patient/treatment"],
  ["◎", "Профиль", "/patient/profile"]
];
const doctorLinks = [["⌂", "Пациенты и статистика", "/doctor"], ["◎", "Профиль", "/doctor/profile"], ["◌", "Статус demo", "/demo-status"]];

export function Nav({ doctor }: { doctor?: boolean }) {
  const links = doctor ? doctorLinks : patientLinks;
  const session = getSession();
  return <>
    <aside className="sidebar">
      <div className="brand">
        <Image className="brand-mark" src="/logo.png" alt="Логотип Колючки" width={48} height={48} priority />
        Колючка
      </div>
      <nav className="nav">{links.map(([icon, label, href]) => <Link href={href} key={href}><span>{icon}</span>{label}</Link>)}</nav>
      <div className="side-bottom">
        <div className="status-pill"><b>Данные защищены</b><br />Синтетический demo-профиль · {session?.role === "DOCTOR" ? "врач" : "пациент"}</div>
        <form action="/api/session" method="post"><input type="hidden" name="action" value="logout" /><button className="button logout full" type="submit">Выйти</button></form>
      </div>
    </aside>
    <nav className="mobile-nav">{links.slice(0,5).map(([icon,label,href]) => <Link href={href} key={href}><span style={{fontSize:18}}>{icon}</span><span>{label}</span></Link>)}</nav>
  </>;
}
