# Колючка — план архитектуры

## Состояние исходного репозитория

Репозиторий был пустым. Реализация начинается с чистого Next.js App Router приложения.

## Решение

- Один Next.js runtime: patient web и doctor web используют общие API routes и `MedicalRecord`.
- `lib/domain.ts` хранит типы домена, синтетическую BDE и `MockMedicalSystemAdapter`.
- `lib/store.ts` — локальный repository для demo; интерфейс изолирован от UI, чтобы заменить на Prisma/SQLite или PostgreSQL.
- Session cookie содержит только demo account id/role; guards на middleware и server pages разделяют PATIENT/DOCTOR.
- AI и environment — provider-слои с явным demo/live статусом; demo не маскируется под production.
- Все события имеют `source`, `sourceChannel`, `dataQuality`, чтобы врачу была видна происхождение данных.

## Поток данных

`MockEmiasDatabase → MedicalSystemAdapter → unified store/MedicalRecord → /api → patient/doctor UI`

Подтверждённый check-in, добавленный через WEB, записывается в одну запись пациента и отображается в истории, графиках и кабинете врача.
