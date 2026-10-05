# Архитектура

Приложение — монолитный Next.js MVP без микросервисов. Это намеренное решение для hackathon/demo: единая доменная модель проще проверяется и не допускает расхождения состояния между каналами.

## Mock EMIAS access

`MockEmiasAuthProvider` проверяет email + demo-пароль, затем создаёт session с отдельной ролью `PATIENT` либо `DOCTOR`. BDE содержит 100 synthetic пациентов и 5 врачей. Медкарта создаётся по `patientId`; врач видит только прикреплённых к нему пациентов.

## AI and channels

Check-in и помощник используют один слой `lib/assistant.ts`: он извлекает только оценку 1–7, симптомы и дневниковый контекст. Перед сохранением требуется подтверждение. Yandex STT имеет server-side demo adapter и явные переменные окружения для будущего live режима.

## Слои

1. `lib/domain.ts` — контракты, synthetic BDE, адаптер медицинской системы.
2. `lib/store.ts` — единая in-memory MedicalRecord и операции записи.
3. `app/api/*` — server-side routes.
4. `components/*` — UI без медицинских записей в локальном состоянии.

Для production слой `store` заменяется ORM repository, а `MockMedicalSystemAdapter` — `RealEmiasAdapter`, не меняя patient workflow.
