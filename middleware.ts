import { NextRequest, NextResponse } from "next/server";
import { getAccount } from "@/lib/domain";

function redirectTo(path: string, status = 307) {
  return new NextResponse(null, {
    status,
    headers: { Location: path }
  });
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const id = request.cookies.get("koluchka-session")?.value;
  const account = id ? getAccount(id) : null;
  if (path === "/login" || path.startsWith("/_next") || path.startsWith("/api/session") || path.includes(".")) return NextResponse.next();
  if (!account && (path.startsWith("/patient") || path.startsWith("/doctor") || path.startsWith("/demo-status"))) {
    return redirectTo("/login");
  }
  if (account?.role === "PATIENT" && path.startsWith("/doctor")) return redirectTo("/patient");
  if (account?.role === "DOCTOR" && path.startsWith("/patient")) return redirectTo("/doctor");
  return NextResponse.next();
}

export const config = { matcher: ["/((?!api).*)"] };
