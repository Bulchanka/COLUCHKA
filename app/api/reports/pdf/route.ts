import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getMedicalRecord } from "@/lib/store";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";

type ReportPhoto = { label: string; dataUrl: string };

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 42;
const MAX_REPORT_PHOTOS = 8;
const MAX_DATA_URL_LENGTH = 5_000_000;

function dataUrlBytes(dataUrl: string) {
  const match = dataUrl.match(/^data:image\/(png|jpe?g);base64,(.+)$/i);
  if (!match) return null;
  return { type: match[1].toLowerCase(), bytes: Buffer.from(match[2], "base64") };
}

function wrapText(text: string, font: any, size: number, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth || !current) current = next;
    else { lines.push(current); current = word; }
  }
  if (current) lines.push(current);
  return lines;
}

export async function POST(request: Request) {
  const session = getSession();
  if (session?.role !== "DOCTOR") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await request.json();
  const patientId = String(body.patientId ?? "");
  const record = getMedicalRecord(patientId);
  if (record.patient.assignedDoctorId !== session.id) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const reportNote = String(body.note ?? "").trim();
  const requestedPhotos = Array.isArray(body.photos) ? body.photos : [];
  const reportPhotos: ReportPhoto[] = requestedPhotos
    .filter((photo: ReportPhoto) => typeof photo?.label === "string" && typeof photo?.dataUrl === "string" && photo.dataUrl.length <= MAX_DATA_URL_LENGTH)
    .slice(0, MAX_REPORT_PHOTOS);

  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const fontPath = ["C:\\Windows\\Fonts\\arial.ttf", "C:\\Windows\\Fonts\\segoeui.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"].find(existsSync);
  const regularFont = fontPath ? await pdf.embedFont(await fs.readFile(fontPath)) : await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = fontPath ? regularFont : await pdf.embedFont(StandardFonts.HelveticaBold);
  const dark = rgb(0.08, 0.2, 0.14);
  const muted = rgb(0.34, 0.45, 0.4);
  const green = rgb(0.13, 0.7, 0.42);
  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const addPageIfNeeded = (height = 30) => {
    if (y - height < MARGIN) { page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]); y = PAGE_HEIGHT - MARGIN; return true; }
    return false;
  };
  const title = (text: string, size = 20) => {
    addPageIfNeeded(size + 16);
    page.drawText(text, { x: MARGIN, y, size, font: boldFont, color: dark });
    y -= size + 10;
  };
  const paragraph = (text: string, size = 10, color = dark, gap = 4) => {
    for (const line of wrapText(text, regularFont, size, PAGE_WIDTH - MARGIN * 2)) {
      addPageIfNeeded(size + 5);
      page.drawText(line, { x: MARGIN, y, size, font: regularFont, color });
      y -= size + 4;
    }
    y -= gap;
  };
  const section = (text: string) => {
    addPageIfNeeded(30);
    y -= 8;
    page.drawText(text, { x: MARGIN, y, size: 13, font: boldFont, color: green });
    y -= 21;
  };
  const row = (label: string, value: string) => {
    addPageIfNeeded(35);
    page.drawText(label, { x: MARGIN, y, size: 9, font: boldFont, color: muted });
    y -= 13;
    paragraph(value, 10, dark, 0);
    y -= 6;
  };

  page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 112, width: PAGE_WIDTH, height: 112, color: rgb(0.87, 1, 0.94) });
  page.drawText("КОЛЮЧКА", { x: MARGIN, y: PAGE_HEIGHT - 58, size: 11, font: boldFont, color: green });
  page.drawText("Отчёт о пациенте", { x: MARGIN, y: PAGE_HEIGHT - 84, size: 24, font: boldFont, color: dark });
  page.drawText(`Сформирован ${new Date().toLocaleDateString("ru-RU")}`, { x: PAGE_WIDTH - 190, y: PAGE_HEIGHT - 83, size: 9, font: regularFont, color: muted });
  y = PAGE_HEIGHT - 145;

  title(record.patient.name);
  paragraph(`${record.patient.age} лет · ${record.patient.clinic} · ${record.patient.diagnosis}`, 10, muted);
  row("ОМС", record.patient.omsPolicyNumber);
  row("Аллергены", record.patient.allergens.join(", ") || "не указаны");
  row("Реакция", record.patient.allergyReaction);
  if (reportNote) { section("Комментарий врача"); paragraph(reportNote, 10); }

  const scores = record.checkIns.map((item) => item.score);
  const average = scores.reduce((sum, score) => sum + score, 0) / Math.max(1, scores.length);
  const adherence = record.medications.reduce((sum, medication) => sum + medication.adherence, 0) / Math.max(1, record.medications.length);
  section("Ключевая статистика");
  row("Среднее самочувствие", `${average.toFixed(1)} из 7`);
  row("Записи самочувствия", String(record.checkIns.length));
  row("Выполнение лечения", `${Math.round(adherence)}%`);
  row("Внешний фон", `${record.environment.city}: берёза ${record.environment.birch ?? "нет данных"}, трава ${record.environment.grass ?? "нет данных"}, сорные травы ${record.environment.weeds ?? "нет данных"}`);

  section("Динамика самочувствия");
  for (const checkIn of record.checkIns) {
    const date = new Date(checkIn.eventTime).toLocaleDateString("ru-RU");
    paragraph(`${date} · ${checkIn.score}/7 · ${checkIn.symptoms.join(", ") || "симптомы не указаны"}`, 10, dark, 1);
    if (checkIn.note) paragraph(checkIn.note, 9, muted, 3);
  }

  section("Назначения");
  for (const medication of record.medications) {
    paragraph(`${medication.name} — ${medication.instruction}; ${medication.schedule}; выполнение ${medication.adherence}%`, 10, dark, 2);
  }

  const allPhotos = [
    ...record.photos.filter((photo) => photo.dataUrl).map((photo) => ({ label: photo.label, dataUrl: photo.dataUrl! })),
    ...reportPhotos
  ];
  if (allPhotos.length) {
    section("Фотографии наблюдений");
    for (const photo of allPhotos) {
      const imageData = dataUrlBytes(photo.dataUrl);
      if (!imageData) continue;
      try {
        const image = imageData.type === "png" ? await pdf.embedPng(imageData.bytes) : await pdf.embedJpg(imageData.bytes);
        addPageIfNeeded(190);
        const scale = Math.min(220 / image.width, 150 / image.height, 1);
        const width = image.width * scale;
        const height = image.height * scale;
        page.drawImage(image, { x: MARGIN, y: y - height, width, height });
        const labelLines = wrapText(photo.label, regularFont, 10, PAGE_WIDTH - MARGIN * 2 - width - 14);
        labelLines.slice(0, 3).forEach((line, index) => {
          page.drawText(line, { x: MARGIN + width + 14, y: y - 12 - index * 14, size: 10, font: regularFont, color: dark });
        });
        y -= Math.max(height, 42) + 18;
      } catch {
        paragraph(`Не удалось вставить изображение: ${photo.label}`, 9, muted);
      }
    }
  }

  const pages = pdf.getPages();
  pages.forEach((currentPage, index) => {
    currentPage.drawText(`Колючка · ${record.patient.name} · ${index + 1}/${pages.length}`, { x: MARGIN, y: 22, size: 8, font: regularFont, color: muted });
  });
  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="koluchka-${patientId}-report.pdf"`
    }
  });
}
