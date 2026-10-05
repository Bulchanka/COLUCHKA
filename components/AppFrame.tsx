import { getSession } from "@/lib/session";
import { Nav } from "@/components/Nav";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AppFrame({ children, doctor = false }: { children: React.ReactNode; doctor?: boolean }) {
  const session = getSession();
  return <div className="app-shell">
    <Nav doctor={doctor} />
    <div className="content">
      <header className="topbar">
        <div><small>{doctor ? "Кабинет врача" : "Личный кабинет"}</small><div style={{ fontWeight: 800, marginTop: 4 }}>{doctor ? session?.displayName : `${session?.displayName.split(" ")[0] ?? "Пациент"}, добрый день`}</div></div>
        <div className="row" style={{ justifyContent: "flex-end" }}><ThemeToggle /><Link href={doctor ? "/doctor/profile" : "/patient/profile"} className="avatar" aria-label="Открыть профиль">{session?.displayName.split(" ").map((n) => n[0]).join("") ?? "SA"}</Link></div>
      </header>
      {children}
    </div>
  </div>;
}
