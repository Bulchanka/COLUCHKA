# Доменная модель

`MedicalRecord` содержит профиль пациента, диагноз, аллергены, назначения, check-in, medication self-report, environment snapshots, фотографии, timeline, AI summaries, report и audit.

Каждая запись хранит `source`, `sourceChannel`, `dataQuality`, `isDemo`, `createdAt`, `eventTime`. Каналы: `WEB`, `MOCK_EMIAS`, `SYSTEM`, `AI`, `ENVIRONMENT_API`.
