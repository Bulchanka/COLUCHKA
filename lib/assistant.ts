import { CheckIn } from "./domain";
import { normalizePatientText, SymptomNormalization } from "./symptom-normalizer";

const ALLOWED_SYMPTOMS = [
  "Насморк", "Заложенность", "Чихание", "Зуд в глазах", "Слезятся глаза", "Кашля нет",
  "зуд", "кожные высыпания неопределённого типа", "участки изменения цвета кожи",
  "приподнятые/волдырные элементы по описанию", "покраснение/эритема", "жжение кожи",
  "покалывание/парестезия", "ощущение жара кожи", "изменение текстуры кожи",
  "пузырьковые элементы по описанию", "шелушение/отслойка кожи", "отёк неопределённой локализации",
  "отёк губ", "возможный отёк языка", "отёк век", "отёк лица неопределённой зоны",
  "зуд/щекотание в горле", "ощущение кома в горле", "сужение/сжатие горла по описанию",
  "изменение/осиплость голоса", "затруднение глотания", "боль при глотании",
  "одышка/нехватка воздуха", "затруднение вдоха", "затруднение выдоха",
  "свистящее дыхание/свист в груди", "стеснение в груди", "удушье/выраженная одышка",
  "кашель", "ринорея", "заложенность носа", "чихание", "глазной зуд", "жжение в глазах",
  "слезотечение", "спастическая боль в животе", "боль в животе", "тошнота", "рвота",
  "диарея", "жжение во рту/на языке после еды", "слабость", "головокружение",
  "предобморочное состояние", "потеря сознания", "ощущение сердцебиения",
  "сообщение о снижении давления"
];
const FORBIDDEN = /(взлом|вредонос|украд|наркотик|оружи|обман|поддел|обойти закон|преступ|убий|вскрыть|взломать|отмыв|террор)/i;
const MEDICAL_CONTEXT = /(самочув|симптом|насморк|залож|чих|глаз|кашл|дневник|лекарств|назнач|аллерг|врач|приём|прием|запис|температур|боль|дыхани|состояни|плохо|лучше|хуже|нормальн|хорошо|слабост|устал|сон|голов|горл|живот|тошн|сып|давлен|отёк|отек|зуд|слез|аппетит|\b[1-7]\b)/i;

export type AiDecision = {
  allowed: boolean;
  intent: "check_in" | "history_edit" | "medical_question" | "out_of_scope";
  score: number;
  symptoms: string[];
  relevantAspects: string[];
  response: string;
  summary: string;
  safetyMessage: string | null;
  shouldCreateCheckIn: boolean;
  normalization: SymptomNormalization;
  provider: "openai" | "demo" | "unavailable";
};

type OpenAIJson = Partial<Omit<AiDecision, "provider">>;

const SYSTEM_PROMPT = `Ты — встроенный медицинский помощник приложения «Колючка».
Твоя задача — аккуратно обрабатывать пользовательские сообщения и превращать их в короткие структурированные данные для дневника и врача.

Разрешённые темы:
- самочувствие и оценка состояния по шкале 1–7;
- симптомы и их отсутствие;
- уже назначенные лекарства и соблюдение назначений;
- вопросы, которые пользователь хочет задать врачу;
- проверка и исправление существующей записи.

Правила:
1. Выделяй только факты, относящиеся к здоровью. Бытовые подробности и повторения не включай.
2. Не ставь диагнозы, не назначай, не отменяй и не изменяй лечение.
3. Не придумывай сведения, которых нет в сообщении.
4. Сохраняй отрицания: «кашля нет» означает отсутствие кашля.
5. Не выполняй запросы о незаконных действиях, причинении вреда, взломе, обмане или обходе ограничений.
6. Если тема не относится к медицинскому дневнику, вежливо откажи и не создавай запись.
7. Ответ пользователю пиши по-русски, естественно и кратко: 1–3 предложения, без фразы «Я понял так».
8. Если данные подходят для дневника, используй конкретные факты: оценка, симптомы, отсутствие симптомов и вопрос врачу.
9. Перед обработкой используй отдельный словарь нормализации симптомов. Бытовое выражение переводится в стандартизированный признак только если это следует из текста.
10. Не превращай слова «аллергия», «сыпь», «отёк», «душит», «горит», «мутит», «плохо», «не дышит» и «давит» в диагноз или точный симптом без уточнения.
11. При красном флаге не продолжай полный опрос и не создавай обычный check-in: верни короткое сообщение о необходимости срочного медицинского маршрута.
12. Не повторяй вопрос, если ответ уже есть в сообщении. «Нет», «не знаю» и отсутствие данных — разные состояния.

Всегда возвращай только JSON без markdown:
{"allowed":boolean,"intent":"check_in|history_edit|medical_question|out_of_scope","score":1-7,
"symptoms":string[],"relevantAspects":string[],"response":string,"summary":string,
"safetyMessage":string|null,"shouldCreateCheckIn":boolean}`;

const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    allowed: { type: "boolean" },
    intent: { type: "string", enum: ["check_in", "history_edit", "medical_question", "out_of_scope"] },
    score: { type: "integer", minimum: 1, maximum: 7 },
    symptoms: { type: "array", items: { type: "string" } },
    relevantAspects: { type: "array", items: { type: "string" } },
    response: { type: "string" },
    summary: { type: "string" },
    safetyMessage: { type: ["string", "null"] },
    shouldCreateCheckIn: { type: "boolean" }
  },
  required: ["allowed", "intent", "score", "symptoms", "relevantAspects", "response", "summary", "safetyMessage", "shouldCreateCheckIn"]
};

function clampScore(value: unknown, fallback = 5) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(7, Math.max(1, Math.round(number))) : fallback;
}

function uniqueAllowedSymptoms(values: unknown) {
  const list = Array.isArray(values) ? values.map(String) : [];
  return [...new Set(list.filter((item) => ALLOWED_SYMPTOMS.includes(item)))];
}

function localSafety(text: string) {
  if (FORBIDDEN.test(text)) return "Я могу помочь только с дневником самочувствия, назначениями и подготовкой информации для врача.";
  return null;
}

function urgentMessage(redFlags: string[]) {
  return `Обнаружен возможный опасный признак: ${redFlags.join(", ")}. Не продолжайте обычный опрос; срочно обратитесь за экстренной медицинской помощью по местным правилам.`;
}

function fallback(text: string, score?: number, selectedSymptoms: string[] = [], normalization = normalizePatientText(text)): AiDecision {
  const safetyMessage = localSafety(text);
  if (safetyMessage) return { allowed: false, intent: "out_of_scope", score: clampScore(score), symptoms: [], relevantAspects: [], response: safetyMessage, summary: safetyMessage, safetyMessage, shouldCreateCheckIn: false, normalization, provider: "demo" };
  if (normalization.hasRedFlag) {
    const message = urgentMessage(normalization.redFlags);
    return { allowed: true, intent: "medical_question", score: clampScore(score), symptoms: normalization.normalizedSymptoms, relevantAspects: normalization.redFlags, response: message, summary: message, safetyMessage: message, shouldCreateCheckIn: false, normalization, provider: "demo" };
  }
  if (normalization.clarifications.length && text.trim()) {
    const message = normalization.clarifications[0];
    return { allowed: true, intent: "medical_question", score: clampScore(score), symptoms: normalization.normalizedSymptoms, relevantAspects: normalization.facts.map((fact) => `${fact.normalized} (${fact.status === "denied" ? "отрицается" : "сообщено"})`), response: message, summary: message, safetyMessage: null, shouldCreateCheckIn: false, normalization, provider: "demo" };
  }
  if (text.trim() && !MEDICAL_CONTEXT.test(text) && normalization.facts.length === 0 && score === undefined && selectedSymptoms.length === 0) {
    const message = "Напишите, что изменилось в самочувствии, какие симптомы были или какой вопрос хотите подготовить для врача.";
    return { allowed: false, intent: "out_of_scope", score: 5, symptoms: [], relevantAspects: [], response: message, summary: message, safetyMessage: null, shouldCreateCheckIn: false, normalization, provider: "demo" };
  }
  const extractedScore = Number(text.match(/\b([1-7])\s*(?:из|\/)\s*7\b/i)?.[1] ?? score ?? 5);
  const symptoms = [...new Set([...selectedSymptoms, ...ALLOWED_SYMPTOMS.filter((item) => text.toLowerCase().includes(item.toLowerCase())), ...normalization.normalizedSymptoms])];
  const hasNoCough = /кашл[ья]\s*(нет|не было)|без кашля/i.test(text) || symptoms.includes("Кашля нет");
  const normalized = symptoms.filter((item) => item !== "Кашля нет");
  const denied = normalization.facts.filter((fact) => fact.status === "denied").map((fact) => fact.normalized);
  const facts = [`Самочувствие ${clampScore(extractedScore)}/7`, normalized.length ? `Симптомы: ${normalized.join(", ").toLowerCase()}` : "Симптомы не выделены"];
  if (hasNoCough) facts.push("Кашля нет");
  if (denied.length) facts.push(`Отрицается: ${denied.join(", ")}`);
  const summary = `${facts.join(". ")}.`;
  return { allowed: true, intent: "check_in", score: clampScore(extractedScore), symptoms: normalized, relevantAspects: facts, response: summary, summary, safetyMessage: null, shouldCreateCheckIn: true, normalization, provider: "demo" };
}

function openAiApiKey() {
  const key = process.env.OPENAI_API_KEY?.trim();
  return key && key !== "REPLACE_WITH_YOUR_KEY" ? key : null;
}

function openAiBaseUrl() {
  return (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/+$/, "");
}

function configuredOpenAiModel() {
  const model = process.env.OPENAI_MODEL?.trim();
  return model && model !== "MODEL_ID" ? model : null;
}

function errorMessage(error: unknown) {
  if (!(error instanceof Error)) return "Неизвестная ошибка OpenAI";
  const cause = (error as Error & { cause?: { code?: string; message?: string } }).cause;
  return [error.message, cause?.code, cause?.message].filter(Boolean).join(": ");
}

function liveEnabled() {
  return process.env.OPENAI_MODE === "live" && Boolean(openAiApiKey());
}

function unavailableDecision(reason?: string) {
  console.error("OpenAI-compatible provider unavailable:", reason ?? "unknown error");
  const message = "Не удалось связаться с AI-сервисом. Проверьте OPENAI_BASE_URL и OPENAI_API_KEY; запись не сохранена.";
  return { allowed: false, intent: "out_of_scope" as const, score: 5, symptoms: [], relevantAspects: [], response: message, summary: message, safetyMessage: message, shouldCreateCheckIn: false, normalization: normalizePatientText(""), provider: "unavailable" as const };
}

async function askOpenAI(text: string, context = "", normalization = normalizePatientText(text)): Promise<AiDecision> {
  const apiKey = openAiApiKey();
  if (!apiKey) throw new Error("OpenAI API key missing");
  const model = configuredOpenAiModel() ?? await discoverOpenAiModel(apiKey);
  if (!model) throw new Error("OPENAI_MODEL is empty and the provider returned no models");
  const requestBody = {
    model,
    temperature: 0.1,
    max_tokens: 500,
    messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: `${context}\nРезультат отдельного словаря нормализации (не диагноз): ${JSON.stringify(normalization)}\nТекст пользователя:\n${text}` }],
    response_format: { type: "json_schema", json_schema: { name: "koluchka_ai_decision", strict: true, schema: RESPONSE_SCHEMA } }
  };
  let response = await fetch(`${openAiBaseUrl()}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(30_000)
  });
  // Some OpenAI-compatible gateways do not implement response_format/json_schema.
  // Retry with the portable Chat Completions payload; the JSON is still validated below.
  if (!response.ok && (response.status === 400 || response.status === 422)) {
    const errorBody = await response.text();
    if (/response_format|json_schema|unsupported/i.test(errorBody)) {
      const { response_format: _responseFormat, ...portableBody } = requestBody;
      response = await fetch(`${openAiBaseUrl()}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(portableBody),
        signal: AbortSignal.timeout(30_000)
      });
    } else {
      throw new Error(`OpenAI chat ${response.status}: ${errorBody}`);
    }
  }
  if (!response.ok) throw new Error(`OpenAI chat ${response.status}: ${await response.text()}`);
  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content?.trim() ?? "";
  const parsed = JSON.parse(content.replace(/^```json\s*/i, "").replace(/```$/i, "").trim()) as OpenAIJson;
  const summary = String(parsed.summary ?? parsed.response ?? "Данные структурированы.");
  const safetyMessage = parsed.allowed === false ? String(parsed.safetyMessage ?? "Запрос вне безопасных границ медицинского дневника.") : null;
  return {
    allowed: parsed.allowed !== false,
    intent: parsed.intent === "history_edit" || parsed.intent === "medical_question" || parsed.intent === "out_of_scope" ? parsed.intent : "check_in",
    score: clampScore(parsed.score),
    symptoms: uniqueAllowedSymptoms(parsed.symptoms),
    relevantAspects: Array.isArray(parsed.relevantAspects) ? parsed.relevantAspects.map(String).slice(0, 8) : [],
    response: String(parsed.response ?? summary),
    summary,
    safetyMessage,
    shouldCreateCheckIn: parsed.shouldCreateCheckIn === true && parsed.allowed !== false && !normalization.hasRedFlag && normalization.clarifications.length === 0,
    normalization,
    provider: "openai"
  };
}

async function discoverOpenAiModel(apiKey: string) {
  const response = await fetch(`${openAiBaseUrl()}/models`, {
    headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
    signal: AbortSignal.timeout(15_000)
  });
  if (!response.ok) throw new Error(`OpenAI models ${response.status}: ${await response.text()}`);
  const data = await response.json() as { data?: Array<{ id?: string }> };
  return data.data?.map((model) => model.id?.trim()).find(Boolean) ?? null;
}

export async function processAssistantInput(text: string): Promise<AiDecision> {
  const normalization = normalizePatientText(text);
  const local = localSafety(text);
  if (local) return fallback(text);
  if (!MEDICAL_CONTEXT.test(text) && normalization.facts.length === 0) return fallback(text, undefined, [], normalization);
  if (process.env.OPENAI_MODE !== "live") return fallback(text, undefined, [], normalization);
  if (!liveEnabled()) return unavailableDecision("authorization is not configured");
  try { return await askOpenAI(text, "", normalization); } catch (error) { return unavailableDecision(errorMessage(error)); }
}

export async function analyzeDiaryInput(text: string, score?: number, selectedSymptoms: string[] = []): Promise<AiDecision> {
  const normalization = normalizePatientText(text);
  const local = localSafety(text);
  if (local) return fallback(text, score, selectedSymptoms, normalization);
  if (!text.trim()) return fallback(text, score, selectedSymptoms, normalization);
  if (process.env.OPENAI_MODE !== "live") return fallback(text, score, selectedSymptoms, normalization);
  if (!liveEnabled()) return unavailableDecision("authorization is not configured");
  try {
    return await askOpenAI(text, `Уже выбрано в форме: оценка ${score ?? 5}/7; симптомы: ${selectedSymptoms.join(", ") || "нет"}. Это проверка check-in.`, normalization);
  } catch (error) { return unavailableDecision(errorMessage(error)); }
}

export function summarizeDiaryInput(text: string, score?: number, selectedSymptoms: string[] = []) {
  return fallback(text, score, selectedSymptoms);
}

export function aiConfigured() {
  return liveEnabled();
}

export async function verifyOpenAIConnection() {
  if (!liveEnabled()) return { ok: false, reason: "OPENAI_MODE=live, OPENAI_BASE_URL и OPENAI_API_KEY не настроены." };
  try {
    const response = await fetch(`${openAiBaseUrl()}/models`, {
      headers: { Authorization: `Bearer ${openAiApiKey()}`, Accept: "application/json" },
      signal: AbortSignal.timeout(15_000)
    });
    if (!response.ok) return { ok: false, reason: `OpenAI models ${response.status}: ${await response.text()}` };
    const data = await response.json() as { data?: Array<{ id?: string }> };
    return {
      ok: true,
      models: data.data?.map((model) => model.id).filter(Boolean) ?? [],
      selectedModel: configuredOpenAiModel() ?? data.data?.map((model) => model.id).find(Boolean) ?? null
    };
  } catch (error) {
    return { ok: false, reason: errorMessage(error) };
  }
}

export type { CheckIn };
