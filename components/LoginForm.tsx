"use client";
import { useState } from "react";

export function LoginForm() {
  const [email, setEmail] = useState("anna.petrova@emias.demo");
  const [password, setPassword] = useState("test58");
  return <form className="login-form" action="/api/session" method="post">
    <div><div className="eyebrow">Авторизация Mock EMIAS</div><h2 style={{ marginTop: 9 }}>Войти в Колючку</h2><p className="muted" style={{ fontSize: 13 }}>Введите email и пароль из демонстрационного пула.</p></div>
    <label>Email<input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
    <label>Пароль<input name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
    <button className="button full" type="submit">Войти через медицинскую систему →</button>
    <div className="actions"><button className="button ghost" type="button" onClick={() => setEmail("anna.petrova@emias.demo")}>Пациент Анна</button><button className="button ghost" type="button" onClick={() => setEmail("elena.smirnova@emias.demo")}>Врач Елена</button></div>
    <div className="status-pill">100 пациентов и 5 врачей — синтетические demo-аккаунты. Все пароли: <b>test58</b>. Полный пул — в <code>ACCOUNTS_DEMO.md</code>.</div>
  </form>;
}
