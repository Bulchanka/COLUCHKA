import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { addPatientPhotos, removePatientPhoto } from "@/lib/store";

const MAX_PHOTOS = 6;
const MAX_DATA_URL_LENGTH = 5_000_000;

export async function POST(request: Request) {
  const session = getSession();
  if (session?.role !== "PATIENT") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await request.json();
  const photos = Array.isArray(body.photos) ? body.photos : [];
  if (!photos.length || photos.length > MAX_PHOTOS) {
    return NextResponse.json({ error: "invalid_photos" }, { status: 400 });
  }
  const valid = photos.filter((photo: { label?: unknown; dataUrl?: unknown }) =>
    typeof photo?.label === "string" &&
    typeof photo?.dataUrl === "string" &&
    /^data:image\/(jpeg|jpg|png|webp);base64,/i.test(photo.dataUrl) &&
    photo.dataUrl.length <= MAX_DATA_URL_LENGTH
  );
  if (!valid.length) return NextResponse.json({ error: "invalid_photo_data" }, { status: 400 });
  const added = addPatientPhotos(session.id, valid, String(body.checkInId ?? "report"));
  if (!added) return NextResponse.json({ error: "check_in_not_found" }, { status: 404 });
  return NextResponse.json({ photos: added });
}

export async function DELETE(request: Request) {
  const session = getSession();
  if (session?.role !== "PATIENT") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const photoId = new URL(request.url).searchParams.get("id");
  if (!photoId) return NextResponse.json({ error: "invalid_photo" }, { status: 400 });
  const photo = removePatientPhoto(session.id, photoId);
  return photo ? NextResponse.json({ photo }) : NextResponse.json({ error: "not_found" }, { status: 404 });
}
