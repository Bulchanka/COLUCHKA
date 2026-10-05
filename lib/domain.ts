export type Role = "PATIENT" | "DOCTOR";
export type SourceChannel = "WEB" | "MOCK_EMIAS" | "SYSTEM" | "AI" | "ENVIRONMENT_API";

export const MOSCOW_CLINICS = [
  "ГП № 1 · Арбат",
  "ГП № 12 · Тверской",
  "ГП № 46 · Марьина Роща",
  "ГП № 67 · Ясенево",
  "ГП № 195 · Крылатское"
] as const;

export type Account = {
  id: string;
  role: Role;
  displayName: string;
  subjectId: string;
  email: string;
  omsPolicyNumber?: string;
  clinic: (typeof MOSCOW_CLINICS)[number];
  specialty?: string;
  assignedDoctorId?: string;
};

export type Medication = {
  id: string; name: string; form: string; instruction: string; schedule: string;
  active: boolean; adherence: number; prescribedBy: string; takenToday?: boolean;
};
import type { SymptomNormalization } from "./symptom-normalizer";

export type CheckIn = {
  id: string; patientId: string; eventTime: string; score: number; symptoms: string[]; note: string;
  source: "WEB"; sourceChannel: SourceChannel; dataQuality: "patient_reported";
  isDemo: boolean; aiSummary?: string; updatedAt?: string; normalization?: SymptomNormalization;
};
export type Photo = { id: string; checkInId: string; label: string; dataUrl?: string; sourceChannel: SourceChannel; createdAt?: string };
export type EnvironmentSnapshot = {
  city: string; date: string; birch: number | null; grass: number | null; weeds: number | null;
  temperature: number; airQuality: string; source: "demo_snapshot"; isDemo: true;
};
export type MedicalRecord = {
  patient: { id: string; name: string; city: string; district: string; age: number; clinic: string; diagnosis: string; allergens: string[]; allergyReaction: string; nextAppointment: string; assignedDoctorId: string; omsPolicyNumber: string; location?: { address: string; lat: number; lon: number } };
  medications: Medication[];
  treatment: { title: string; instruction: string; reminder: string; adherence: number };
  environment: EnvironmentSnapshot; checkIns: CheckIn[]; photos: Photo[];
  audit: { id: string; event: string; channel: SourceChannel; at: string }[];
};
export type Announcement = {
  id: string;
  title: string;
  message: string;
  recipients: "ALL" | string[];
  createdAt: string;
  createdBy: string;
};

const FEMALE_FIRST_NAMES = ["Анна", "Вера", "Диана", "Жанна", "Злата", "Инга", "Кира", "Лейла", "Мадина", "Нина", "Олеся", "Полина", "Регина", "Светлана", "Таисия", "Ульяна", "Фаина", "Элина", "Юлия", "Яна", "Амина", "Валерия", "Галина", "Лидия", "Милана", "Надежда", "Рада", "Сабина", "Тамара", "Эвелина"];
const MALE_FIRST_NAMES = ["Артём", "Борис", "Виктор", "Глеб", "Давид", "Егор", "Захар", "Илья", "Кирилл", "Лев", "Марат", "Назар", "Оскар", "Платон", "Ринат", "Степан", "Тимур", "Филипп", "Харитон", "Эмиль", "Ян", "Арсен", "Денис", "Камиль", "Мирон", "Нурлан", "Родион", "Савелий", "Тарас", "Эрик"];
const FEMALE_LAST_NAMES = ["Абрамова", "Багирова", "Воронцова", "Гасанова", "Демидова", "Ершова", "Жукова", "Зорина", "Исаева", "Калинина", "Лебедева", "Мельникова", "Нестерова", "Одинцова", "Пахомова", "Рахимова", "Савельева", "Тарасова", "Уварова", "Хасанова", "Царёва", "Чернышёва", "Шарипова", "Юдина", "Якубова", "Беляева", "Громова", "Долгова", "Евсеева", "Ковалёва"];
const MALE_LAST_NAMES = ["Абрамов", "Багиров", "Воронцов", "Гасанов", "Демидов", "Ершов", "Жуков", "Зорин", "Исаев", "Калинин", "Лебедев", "Мельников", "Нестеров", "Одинцов", "Пахомов", "Рахимов", "Савельев", "Тарасов", "Уваров", "Хасанов", "Царёв", "Чернышёв", "Шарипов", "Юдин", "Якубов", "Беляев", "Громов", "Долгов", "Евсеев", "Ковалёв"];

type AllergyProfile = {
  diagnosis: string;
  allergens: string[];
  reaction: string;
};

const ALLERGY_PROFILES: AllergyProfile[] = [
  { diagnosis: "Сезонный аллергический ринит", allergens: ["Берёза"], reaction: "Чихание и водянистый насморк" },
  { diagnosis: "Сезонный аллергический риноконъюнктивит", allergens: ["Злаки"], reaction: "Зуд в глазах и слезотечение" },
  { diagnosis: "Поллиноз", allergens: ["Сорные травы"], reaction: "Заложенность носа и першение в горле" },
  { diagnosis: "Аллергический ринит круглогодичный", allergens: ["Домашняя пыль"], reaction: "Ночная заложенность носа и кашель" },
  { diagnosis: "Эпидермальная аллергия", allergens: ["Кошка"], reaction: "Кашель и свистящее дыхание при контакте" },
  { diagnosis: "Эпидермальная аллергия", allergens: ["Собака"], reaction: "Крапивница и зуд кожи после контакта" },
  { diagnosis: "Сезонный аллергический риноконъюнктивит", allergens: ["Берёза", "Злаки"], reaction: "Чихание, зуд в глазах и слезотечение" },
  { diagnosis: "Аллергический ринит круглогодичный", allergens: ["Домашняя пыль", "Кошка"], reaction: "Насморк и одышка при длительном контакте" },
  { diagnosis: "Поллиноз", allergens: ["Берёза", "Сорные травы"], reaction: "Зуд в носу и покраснение глаз" },
  { diagnosis: "Контактная аллергическая реакция", allergens: ["Собака", "Кошка"], reaction: "Покраснение кожи и зуд в месте контакта" },
  { diagnosis: "Аллергический ринит смешанной этиологии", allergens: ["Домашняя пыль", "Злаки"], reaction: "Утреннее чихание и заложенность носа" },
  { diagnosis: "Сезонный аллергический ринит", allergens: ["Сорные травы", "Берёза"], reaction: "Насморк, зуд в горле и сухой кашель" }
];

const allergyProfileFor = (patientNumber: number) => ALLERGY_PROFILES[(patientNumber - 1) % ALLERGY_PROFILES.length];

export const DOCTORS: Account[] = [
  { id: "doctor-1", role: "DOCTOR", displayName: "Елена Смирнова", email: "elena.smirnova@emias.demo", subjectId: "BDE-D-001", clinic: MOSCOW_CLINICS[0], specialty: "аллерголог-иммунолог" },
  { id: "doctor-2", role: "DOCTOR", displayName: "Александр Орлов", email: "alexander.orlov@emias.demo", subjectId: "BDE-D-002", clinic: MOSCOW_CLINICS[1], specialty: "аллерголог-иммунолог" },
  { id: "doctor-3", role: "DOCTOR", displayName: "Марина Белова", email: "marina.belova@emias.demo", subjectId: "BDE-D-003", clinic: MOSCOW_CLINICS[2], specialty: "врач-терапевт" },
  { id: "doctor-4", role: "DOCTOR", displayName: "Павел Крылов", email: "pavel.krylov@emias.demo", subjectId: "BDE-D-004", clinic: MOSCOW_CLINICS[3], specialty: "аллерголог-иммунолог" },
  { id: "doctor-5", role: "DOCTOR", displayName: "Оксана Романова", email: "oksana.romanova@emias.demo", subjectId: "BDE-D-005", clinic: MOSCOW_CLINICS[4], specialty: "врач-терапевт" }
];

export const PATIENTS: Account[] = Array.from({ length: 100 }, (_, index) => {
  const number = index + 1;
  const isAnna = number === 1;
  const clinicIndex = index % MOSCOW_CLINICS.length;
  const identityIndex = Math.floor(index / 2);
  const isFemale = index % 2 === 0;
  const firstNames = isFemale ? FEMALE_FIRST_NAMES : MALE_FIRST_NAMES;
  const lastNames = isFemale ? FEMALE_LAST_NAMES : MALE_LAST_NAMES;
  return {
    id: isAnna ? "anna" : `patient-${String(number).padStart(3, "0")}`,
    role: "PATIENT" as const,
    displayName: isAnna ? "Анна Петрова" : `${firstNames[identityIndex % firstNames.length]} ${lastNames[(identityIndex * 7 + 3) % lastNames.length]}`,
    email: isAnna ? "anna.petrova@emias.demo" : `patient${String(number).padStart(3, "0")}@emias.demo`,
    subjectId: `BDE-P-${String(number).padStart(3, "0")}`,
    omsPolicyNumber: isAnna ? "4500 1234 5678 901" : `4500 ${String(1000 + number).padStart(4, "0")} ${String(2000 + number).padStart(4, "0")} ${String(3000 + number).padStart(4, "0")}`,
    clinic: MOSCOW_CLINICS[clinicIndex],
    assignedDoctorId: DOCTORS[clinicIndex].id
  };
});
export const ACCOUNTS = [...PATIENTS, ...DOCTORS];
export const BDE = {
  patients: PATIENTS, doctors: DOCTORS,
  medications: PATIENTS.flatMap((patient, index) => {
    const doctor = DOCTORS.find((item) => item.id === patient.assignedDoctorId)?.displayName ?? "Врач";
    return [
      { id: `emias-med-${patient.id}-1`, patientId: patient.id, name: "Назальный спрей", form: "спрей", instruction: "1 впрыск утром и вечером", schedule: "08:00 · 20:00", active: true, adherence: patient.id === "anna" ? 86 : 78, prescribedBy: doctor, source: "mock_emias", integrationMode: "demo" },
      { id: `emias-med-${patient.id}-2`, patientId: patient.id, name: index % 2 ? "Антигистаминный препарат" : "Цетиризин", form: "таблетки", instruction: "По одной таблетке вечером согласно назначению", schedule: "21:00", active: true, adherence: patient.id === "anna" ? 92 : 83, prescribedBy: doctor, source: "mock_emias", integrationMode: "demo" }
    ];
  }),
  diagnoses: PATIENTS.map((patient) => ({ patientId: patient.id, name: allergyProfileFor(Number(patient.subjectId.slice(-3))).diagnosis, source: "mock_emias", integrationMode: "demo" })),
  allergies: PATIENTS.flatMap((patient) => {
    const profile = allergyProfileFor(Number(patient.subjectId.slice(-3)));
    return profile.allergens.map((name) => ({ patientId: patient.id, name, reaction: profile.reaction, confirmed: true, source: "mock_emias", integrationMode: "demo" }));
  }),
  appointments: PATIENTS.map((patient) => ({ patientId: patient.id, date: "2026-10-16", title: "Контрольный приём", source: "mock_emias", integrationMode: "demo" }))
} as const;

export const getAccount = (id: string) => ACCOUNTS.find((account) => account.id === id);
export const getDoctorsForClinic = (clinic: string) => DOCTORS.filter((doctor) => doctor.clinic === clinic);
export function authenticateMockEmias(email: string, password: string) {
  return password === "test58" ? ACCOUNTS.find((account) => account.email.toLowerCase() === email.trim().toLowerCase()) ?? null : null;
}

export const initialRecord = (patientId = "anna"): MedicalRecord => {
  const account = getAccount(patientId);
  const patient = account?.role === "PATIENT" ? account : PATIENTS[0];
  const doctor = getAccount(patient.assignedDoctorId ?? DOCTORS[0].id)?.displayName ?? "Врач";
  const isAnna = patient.id === "anna";
  const allergyProfile = allergyProfileFor(Number(patient.subjectId.slice(-3)));
  return {
    patient: { id: patient.id, name: patient.displayName, city: "Москва", district: ["arbat", "tverskoy", "marina-roshcha", "yasenevo", "krylatskoye"][Number(patient.subjectId.slice(-3)) % 5], age: 25 + (Number(patient.subjectId.slice(-3)) % 29), clinic: patient.clinic, diagnosis: allergyProfile.diagnosis, allergens: allergyProfile.allergens, allergyReaction: allergyProfile.reaction, nextAppointment: "16 октября", assignedDoctorId: patient.assignedDoctorId ?? DOCTORS[0].id, omsPolicyNumber: patient.omsPolicyNumber ?? "не указан", location: { address: "Москва", lat: 55.751244, lon: 37.618423 } },
    medications: BDE.medications.filter((medication) => medication.patientId === patient.id).map(({ patientId: _patientId, source: _source, integrationMode: _integrationMode, ...medication }) => medication),
    treatment: { title: "Назальный спрей", instruction: "1 впрыск утром и вечером", reminder: "Сегодня в 20:00", adherence: isAnna ? 86 : 78 },
    environment: { city: "Москва", date: "5 октября 2026", birch: 3, grass: 1, weeds: 2, temperature: 12, airQuality: "Хорошее", source: "demo_snapshot", isDemo: true },
    checkIns: [
      { id: `${patient.id}-ci-1`, patientId: patient.id, eventTime: "2026-10-05T08:30:00", score: 6, symptoms: ["Насморк", "Заложенность"], note: "Утром немного заложен нос", source: "WEB", sourceChannel: "WEB", dataQuality: "patient_reported", isDemo: true, aiSummary: "Самочувствие 6/7. Отмечены насморк и заложенность; кашель не отмечен." },
      { id: `${patient.id}-ci-2`, patientId: patient.id, eventTime: "2026-10-04T09:10:00", score: 7, symptoms: ["Чихание"], note: "На улице было легче, чем вчера", source: "WEB", sourceChannel: "WEB", dataQuality: "patient_reported", isDemo: true, aiSummary: "Самочувствие 7/7. Отмечено чихание; других симптомов нет." },
      { id: `${patient.id}-ci-3`, patientId: patient.id, eventTime: "2026-10-02T09:00:00", score: 5, symptoms: ["Насморк", "Зуд в глазах"], note: "Симптомы усилились после прогулки", source: "WEB", sourceChannel: "WEB", dataQuality: "patient_reported", isDemo: true, aiSummary: "Самочувствие 5/7. Отмечены насморк и зуд в глазах." }
    ],
    photos: [],
    audit: [
      { id: `${patient.id}-a-1`, event: "Импортирован диагноз", channel: "MOCK_EMIAS", at: "1 октября" },
      { id: `${patient.id}-a-2`, event: "Добавлен check-in", channel: "WEB", at: "4 октября" },
      { id: `${patient.id}-a-3`, event: "Добавлен check-in", channel: "WEB", at: "5 октября" }
    ]
  };
};
