import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  if (getSession()?.role !== "PATIENT") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const apiKey = process.env.YANDEX_STT_API_KEY;
  const folderId = process.env.YANDEX_FOLDER_ID ?? process.env.YANDEX_STT_FOLDER_ID;
  if (!apiKey || !folderId) {
    return NextResponse.json(
      { error: "Yandex STT не настроен: добавьте YANDEX_STT_API_KEY и YANDEX_FOLDER_ID." },
      { status: 503 }
    );
  }

  const contentType = request.headers.get("content-type")?.split(";")[0].trim();
  if (contentType !== "audio/ogg") {
    return NextResponse.json({ error: "Ожидается аудиозапись в формате Ogg Opus." }, { status: 415 });
  }

  const audio = await request.arrayBuffer();
  if (!audio.byteLength || audio.byteLength > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Размер аудиозаписи должен быть от 1 байта до 10 МБ." }, { status: 413 });
  }

  const params = new URLSearchParams({
    folderId,
    lang: process.env.YANDEX_STT_LANG ?? "ru-RU",
    format: "oggopus"
  });
  if (process.env.YANDEX_STT_SAMPLE_RATE_HZ) {
    params.set("sampleRateHertz", process.env.YANDEX_STT_SAMPLE_RATE_HZ);
  }

  const response = await fetch(`https://stt.api.cloud.yandex.net/speech/v1/stt:recognize?${params}`, {
    method: "POST",
    headers: {
      Authorization: `Api-Key ${apiKey}`,
      "Content-Type": "audio/ogg"
    },
    body: audio
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || typeof data.result !== "string") {
    console.error("Yandex STT error", response.status, data);
    return NextResponse.json({ error: "Yandex STT не смог распознать аудио." }, { status: 502 });
  }

  return NextResponse.json({ text: data.result, provider: "yandex_stt", mode: "live", isDemo: false });
}
