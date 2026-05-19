# Changelog — FITGYM Backend

Формат за [Keep a Changelog](https://keepachangelog.com/uk/1.0.0/),
версіонування — [SemVer](https://semver.org/lang/uk/).

## [1.1.0] — 2026-05-19

### Added
- **Гаманець клієнта**: поле `Member.deposit_balance` + append-only ledger
  `WalletTransaction` (`balance_after`, kind: topup/charge/refund/adjust).
  Сервіси `top_up_wallet` / `charge_wallet` (атомарні, баланс не йде у мінус).
  Ендпоінти: `GET /api/me/wallet/`, `POST /api/me/wallet/topup/init/` +
  `/confirm/` (LiqPay), `POST /api/admin/members/<id>/wallet/adjust/`
  (gym-isolated). `deposit_balance` додано у `GET /api/me/`.
- **Push «абонемент закінчується»**: моделі `DeviceToken` + `NotificationLog`
  (ідемпотентність), сервіс `crm/notifications.py`, команда
  `python manage.py notify_expiring [--days N]` (Task Scheduler / cron),
  ендпоінт `POST /api/me/device-token/`.
- **GymOwner invite-link**: модель `GymInvite` (одноразовий код),
  `POST /api/admin/invites/` (IsGymStaff, gym-isolated),
  `GET /api/invites/<code>/` (прев'ю), `POST /api/invites/<code>/accept/`
  (реєстрація → token; staff→Instructor, member→Member).

### Changed
- PostgreSQL connector `psycopg[binary]` увімкнено; міграції + повний
  тест-набір + `seed_demo` верифіковано на PostgreSQL 16.
- API version у Swagger (`/api/docs/`) → 1.1.0.

### Tests
- 46 → **79** unit-тестів (зелені на SQLite і на PostgreSQL):
  `WalletTests`, `PushNotificationTests`, `GymInviteTests`.

## [1.0.0] — 2026-05-14 (mega-completion спринт)

Базовий MVP: 13 моделей, multi-tenancy (gym isolation, `IsGymStaff`),
Token Auth, QR check-in (`/api/access/check/` + append-only `Attendance`),
часові тарифи, LiqPay sandbox checkout, Telegram-бот, self-service
реєстрація залу, CSV-експорти, Dashboard-аналітика, rate-limit на логіні,
drf-spectacular (Swagger), docker-compose + Dockerfile.
