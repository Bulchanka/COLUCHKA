import { NextResponse } from "next/server";
import { authenticateMockEmias, getAccount } from "@/lib/domain";
import { sessionCookieName } from "@/lib/session";

function redirectTo(path: string) {
  return new NextResponse(null, {
    status: 303,
    headers: { Location: path }
  });
}

export async function GET() {
  const { cookies } = await import("next/headers");
  const id = cookies().get(sessionCookieName())?.value;
  const account = id ? getAccount(id) : undefined;
  return NextResponse.json({ account: account ?? null });
}

export async function POST(request: Request) {
  const form = await request.formData();
  if (form.get("action") === "logout") {
    const response = redirectTo("/login");
    response.cookies.delete(sessionCookieName());
    return response;
  }
  const account = form.get("email")
    ? authenticateMockEmias(String(form.get("email")), String(form.get("password") ?? ""))
    : getAccount(String(form.get("accountId") ?? ""));
  if (!account) return redirectTo("/login");
  const response = redirectTo(account.role === "DOCTOR" ? "/doctor" : "/patient");
  response.cookies.set(sessionCookieName(), account.id, { httpOnly: true, sameSite: "lax", path: "/" });
  return response;
}
