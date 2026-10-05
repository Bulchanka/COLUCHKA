# API contract

- `POST /api/session` — demo login; body `{ accountId }`.
- `GET /api/session` — текущая session и профиль.
- `DELETE /api/session` — logout.
- `GET /api/record` — patient MedicalRecord.
- `POST /api/checkins` — подтверждённый check-in из WEB.
- `POST /api/assistant` — сообщение помощнику с подготовкой check-in для подтверждения.
- `GET /api/doctor/patients` — список доступных пациентов для DOCTOR.
- `GET /api/doctor/patients/:id` — patient summary/report.
- `POST /api/reset` — reset demo data (DOCTOR).
