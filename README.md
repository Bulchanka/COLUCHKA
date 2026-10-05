# Колючка

Единый demo-продукт для пациента с сезонным аллергическим ринитом: patient web и doctor web используют одну `MedicalRecord`.

## Запуск

```bash
npm install
npm run dev
```

Откройте `http://localhost:3000/login`. Вход синтетический:

Для Windows можно запустить `start-koluchka.bat` двойным кликом: батник установит зависимости при необходимости, запустит сервер и откроет экран входа.

- **Анна Петрова** — patient flow;
- **Елена Смирнова** — doctor flow.

## Сквозной demo

1. Войдите как Анна.
2. `/patient/check-in` → заполните → «Проверить запись» → «Всё верно, сохранить».
3. `/patient/history` показывает новую запись.
4. `/patient/assistant` → «Отметить самочувствие» создаёт событие с `source_channel: WEB` в той же истории.
5. Выйдите, войдите как Елена → `/doctor/patients/anna`: записи, AI-сводка, лечение, график и provenance.

## Ограничения demo

Данные синтетические и хранятся в памяти процесса; после перезапуска dev server сбрасываются. Настоящая ЕМИАС, погода, пыльца, фото storage и Yandex Maps не подключены. AI подключается через OpenAI-compatible API; все ограничения вынесены в `/demo-status`.

## Документация

`ARCHITECTURE.md`, `ARCHITECTURE_PLAN.md`, `DATA_MODEL.md`, `API_CONTRACT.md`, `SAFETY_RULES.md`, `INTEGRATIONS.md`, `DEMO_STATUS.md`, `DEMO_RUNBOOK.md`, `VISUAL_PLAN.md`.

## Demo-авторизация

Вход выполняется через Mock EMIAS по email и паролю. В проекте 100 synthetic patient accounts и 5 врачей; общий пароль — `test58`. Полный список: `ACCOUNTS_DEMO.md`.

## AI и голос

Помощник и check-in используют один server-side слой структурирования записи. До подтверждения пользователя запись является черновиком. Yandex STT доступен через demo adapter; live-режим требует `YANDEX_STT_API_KEY`.

# Словарь человеческой речи

Нормализация симптомов вынесена в отдельный слой `lib/symptom-normalizer.ts`.
Он использует правила из `data/slovar_normalizacii_simptomov_kolyuchka.txt` и
переводит бытовые фразы в стандартизированные признаки без постановки диагноза.
Слой работает до AI, его результат передаётся в OpenAI-compatible API как фактический контекст
и сохраняется в предварительной записи check-in.

Для независимой проверки словаря доступен `POST /api/symptom-normalize` с телом
`{"text":"После еды меня обсыпало, губы раздуло"}`. Endpoint возвращает найденные
факты, уточняющие вопросы и красные флаги.
