import { Announcement, CheckIn, MedicalRecord, Medication, PATIENTS, getAccount, initialRecord } from "./domain";
import { AiDecision, analyzeDiaryInput } from "./assistant";
import { ALLERGENS, MOSCOW_DISTRICTS, getDistrict } from "./location";

declare global {
  // eslint-disable-next-line no-var
  var __koluchkaRecords: Record<string, MedicalRecord> | undefined;
  var __koluchkaAnnouncements: Announcement[] | undefined;
}

const records = () => {
  if (!globalThis.__koluchkaRecords) globalThis.__koluchkaRecords = {};
  return globalThis.__koluchkaRecords;
};
export function getMedicalRecord(patientId = "anna") {
  const store = records();
  if (!store[patientId]) store[patientId] = initialRecord(patientId);
  return store[patientId];
}
export function getRecordsForDoctor(doctorId: string) {
  return PATIENTS.filter((patient) => patient.assignedDoctorId === doctorId).map((patient) => getMedicalRecord(patient.id));
}
export function getAnnouncementsForPatient(patientId: string) {
  const announcements = globalThis.__koluchkaAnnouncements ?? [];
  return announcements.filter((item) => item.recipients === "ALL" || item.recipients.includes(patientId));
}
export function createAnnouncement(input: Omit<Announcement, "id" | "createdAt">) {
  const item: Announcement = { ...input, id: `announcement-${Date.now()}`, createdAt: new Date().toISOString() };
  globalThis.__koluchkaAnnouncements = [item, ...(globalThis.__koluchkaAnnouncements ?? [])];
  return item;
}
export function resetMedicalRecord() { globalThis.__koluchkaRecords = {}; globalThis.__koluchkaAnnouncements = []; return getMedicalRecord(); }

type DiaryInput = Pick<CheckIn, "score" | "symptoms" | "note" | "source"> & { eventTime?: string };
async function enrich(input: DiaryInput) {
  return analyzeDiaryInput(input.note, input.score, input.symptoms);
}

export async function previewCheckIn(patientId: string, input: DiaryInput) {
  const result = await enrich(input);
  return previewCheckInFromDecision(patientId, input, result);
}
export function previewCheckInFromDecision(patientId: string, input: DiaryInput, result: AiDecision) {
  return { id: "preview", patientId, eventTime: input.eventTime ?? new Date().toISOString(), ...input, score: result.score, symptoms: result.symptoms, sourceChannel: input.source, dataQuality: "patient_reported" as const, isDemo: result.provider === "demo", aiSummary: result.summary, normalization: result.normalization, safetyMessage: result.safetyMessage, aiProvider: result.provider };
}
export async function addCheckIn(patientId: string, input: DiaryInput) {
  const result = await enrich(input);
  const record = getMedicalRecord(patientId);
  const checkIn: CheckIn = { id: `ci-${Date.now()}`, patientId, eventTime: new Date().toISOString(), ...input, score: result.score, symptoms: result.symptoms, sourceChannel: input.source, dataQuality: "patient_reported", isDemo: result.provider === "demo", aiSummary: result.summary, normalization: result.normalization };
  record.checkIns.unshift(checkIn);
  record.audit.unshift({ id: `a-${Date.now()}`, event: "Добавлен check-in после AI-проверки", channel: input.source, at: "только что" });
  return checkIn;
}
export async function previewCheckInEdit(patientId: string, id: string, input: Omit<DiaryInput, "source">) {
  const record = getMedicalRecord(patientId);
  const existing = record.checkIns.find((item) => item.id === id);
  if (!existing) return null;
  const result = await enrich({ ...input, source: existing.source });
  return { checkIn: { ...existing, score: result.score, symptoms: result.symptoms, note: input.note, aiSummary: result.summary, normalization: result.normalization }, safetyMessage: result.safetyMessage, aiProvider: result.provider };
}
export async function updateCheckIn(patientId: string, id: string, input: Omit<DiaryInput, "source">) {
  const preview = await previewCheckInEdit(patientId, id, input);
  if (!preview || preview.safetyMessage) return null;
  const record = getMedicalRecord(patientId);
  const checkIn = record.checkIns.find((item) => item.id === id);
  if (!checkIn) return null;
  Object.assign(checkIn, { score: preview.checkIn.score, symptoms: preview.checkIn.symptoms, note: input.note, aiSummary: preview.checkIn.aiSummary, normalization: preview.checkIn.normalization, updatedAt: new Date().toISOString() });
  record.audit.unshift({ id: `a-${Date.now()}`, event: "Исправлен check-in после AI-проверки", channel: "WEB", at: "только что" });
  return checkIn;
}
export function saveReviewedCheckIn(patientId: string, preview: CheckIn) {
  const record = getMedicalRecord(patientId);
  const checkIn: CheckIn = { ...preview, id: `ci-${Date.now()}`, patientId, eventTime: preview.eventTime ?? new Date().toISOString() };
  record.checkIns.unshift(checkIn);
  record.audit.unshift({ id: `a-${Date.now()}`, event: "Добавлен check-in после AI-проверки", channel: checkIn.source, at: "только что" });
  return checkIn;
}
export function saveReviewedCheckInEdit(patientId: string, preview: CheckIn) {
  const record = getMedicalRecord(patientId);
  const existing = record.checkIns.find((item) => item.id === preview.id);
  if (!existing) return null;
  Object.assign(existing, { score: preview.score, symptoms: preview.symptoms, note: preview.note, aiSummary: preview.aiSummary, updatedAt: new Date().toISOString() });
  record.audit.unshift({ id: `a-${Date.now()}`, event: "Исправлен check-in после AI-проверки", channel: "WEB", at: "только что" });
  return existing;
}
export function selectDoctor(patientId: string, doctorId: string) {
  const record = getMedicalRecord(patientId);
  const doctor = getAccount(doctorId);
  if (doctor?.role !== "DOCTOR" || doctor.clinic !== record.patient.clinic) return null;
  record.patient.assignedDoctorId = doctorId;
  record.medications.forEach((medication) => { medication.prescribedBy = doctor.displayName; });
  return record;
}
export function addMedication(patientId: string, medication: Omit<Medication, "id" | "adherence"> & { adherence?: number }) {
  const record = getMedicalRecord(patientId);
  const item = { ...medication, adherence: medication.adherence ?? 0, id: `med-${Date.now()}` };
  record.medications.push(item);
  record.audit.unshift({ id: `a-${Date.now()}`, event: "Врач добавил назначение", channel: "SYSTEM", at: "только что" });
  return item;
}
export function toggleMedication(patientId: string, medicationId: string) {
  const record = getMedicalRecord(patientId);
  const medication = record.medications.find((item) => item.id === medicationId);
  if (!medication) return null;
  if (medication.takenToday) return medication;
  medication.adherence = Math.min(100, medication.adherence + 1);
  medication.takenToday = true;
  record.audit.unshift({ id: `a-${Date.now()}`, event: "Отмечен приём назначения", channel: "WEB", at: "только что" });
  return medication;
}
export function undoMedication(patientId: string, medicationId: string) {
  const record = getMedicalRecord(patientId);
  const medication = record.medications.find((item) => item.id === medicationId);
  if (!medication) return null;
  if (!medication.takenToday) return medication;
  medication.adherence = Math.max(0, medication.adherence - 1);
  medication.takenToday = false;
  record.audit.unshift({ id: `a-${Date.now()}`, event: "Отменена отметка о приёме", channel: "WEB", at: "только что" });
  return medication;
}
export function addPatientPhotos(patientId: string, photos: Array<Pick<MedicalRecord["photos"][number], "label" | "dataUrl">>, checkInId = "report") {
  const record = getMedicalRecord(patientId);
  if (checkInId !== "report" && !record.checkIns.some((checkIn) => checkIn.id === checkInId)) return null;
  const added = photos.map((photo, index) => ({
    id: `photo-${Date.now()}-${index}`,
    checkInId,
    label: photo.label,
    dataUrl: photo.dataUrl,
    sourceChannel: "WEB" as const,
    createdAt: new Date().toISOString()
  }));
  record.photos.unshift(...added);
  record.audit.unshift({ id: `a-${Date.now()}`, event: `Добавлено фото в отчёт (${added.length})`, channel: "WEB", at: "только что" });
  return added;
}
export function removePatientPhoto(patientId: string, photoId: string) {
  const record = getMedicalRecord(patientId);
  const index = record.photos.findIndex((photo) => photo.id === photoId);
  if (index < 0) return null;
  const [removed] = record.photos.splice(index, 1);
  record.audit.unshift({ id: `a-${Date.now()}`, event: "Фото откреплено от записи", channel: "WEB", at: "только что" });
  return removed;
}
export function updatePatientContext(patientId: string, district: string, allergens: string[], location?: { address: string; lat: number; lon: number }) {
  const record = getMedicalRecord(patientId);
  const selectedDistrict = getDistrict(district);
  record.patient.district = selectedDistrict.id;
  record.patient.allergens = allergens.filter((item) => ALLERGENS.includes(item as (typeof ALLERGENS)[number]));
  if (location && Number.isFinite(location.lat) && Number.isFinite(location.lon)) {
    record.patient.location = { address: String(location.address || "Выбранная точка"), lat: Number(location.lat), lon: Number(location.lon) };
  }
  record.audit.unshift({ id: `a-${Date.now()}`, event: "Обновлён контекст пациента", channel: "WEB", at: "только что" });
  return record;
}
export { ALLERGENS, MOSCOW_DISTRICTS };
