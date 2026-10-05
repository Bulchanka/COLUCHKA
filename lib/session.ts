import { cookies } from "next/headers";
import { Account, getAccount } from "./domain";

const SESSION = "koluchka-session";

export function getSession(): Account | null {
  const id = cookies().get(SESSION)?.value;
  return id ? getAccount(id) ?? null : null;
}

export function sessionCookieName() {
  return SESSION;
}
