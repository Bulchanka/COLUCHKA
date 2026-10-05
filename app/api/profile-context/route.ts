import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { updatePatientContext } from "@/lib/store";
import { getDistrictForLocation } from "@/lib/location";

export async function PATCH(request: Request) {
  const session = getSession();
  if (session?.role !== "PATIENT") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await request.json();
  const location = body.location && typeof body.location === "object" ? {
    address: String(body.location.address ?? ""),
    lat: Number(body.location.lat),
    lon: Number(body.location.lon)
  } : undefined;
  const district = getDistrictForLocation(location)?.id ?? String(body.district ?? "");
  return NextResponse.json({ record: updatePatientContext(session.id, district, Array.isArray(body.allergens) ? body.allergens : [], location) });
}
