import { LoginForm } from "@/components/LoginForm";
import Image from "next/image";

export default function LoginPage() {
  return <main className="login-page">
    <section className="login-card">
      <div className="login-visual">
        <div><div className="brand"><Image className="brand-mark" src="/logo.png" alt="Логотип Колючки" width={48} height={48} priority /> Колючка</div><div style={{ marginTop: 60 }}><div className="eyebrow">Между визитами</div><h1 style={{ marginTop: 12 }}>Понятнее<br />о себе каждый день</h1><p className="muted">Самочувствие, назначения и врач — в одном защищённом контуре.</p></div></div>
        <div className="circle" />
      </div>
      <LoginForm />
    </section>
  </main>;
}
