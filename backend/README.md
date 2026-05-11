# FITGYM Backend

> Django REST API для B2B SaaS-платформи управління фітнес-клубами FITGYM.
> Частина дипломного проекту (БФКПЕП, спеціальність 121, 2026 р.) + поданий на конкурс IT-Universe 2026.

[![Tests](https://img.shields.io/badge/tests-16%2F16%20passing-brightgreen)]() [![Python](https://img.shields.io/badge/python-3.12%2B-blue)]() [![Django](https://img.shields.io/badge/Django-4.2-green)]() [![DRF](https://img.shields.io/badge/DRF-3.16-red)]()

---

## 📍 Це частина монорепо FITGYM

| Репо | Призначення |
|---|---|
| **FITGYM-backend** (цей репо) | Django + DRF REST API |
| FITGYM-frontend | React + Vite веб-адмінка + лендинг |
| FITGYM-mobile | React Native + Expo застосунок клієнтів |

Усі три застосунки взаємодіють виключно через REST API цього репо.

---

## ⚡ Швидкий старт

```bash
git clone <repo-url>
cd gym_project

# venv (Windows)
python -m venv venv
venv\Scripts\activate

# Залежності
pip install -r requirements.txt

# БД + демо-дані
python manage.py migrate
python manage.py loaddata crm/fixtures/demo_data.json

# Адмін (SuperUser для веб-адмінки Django)
python manage.py createsuperuser

# Запуск
python manage.py runserver 0.0.0.0:8000
```

Перевірка:
- API: <http://localhost:8000/api/>
- Swagger UI: <http://localhost:8000/api/docs/>
- ReDoc: <http://localhost:8000/api/redoc/>
- Django Admin: <http://localhost:8000/admin/>

---

## 🏗️ Архітектурні принципи

### 1. Multi-tenancy (shared schema)

Кожна модель з клієнтськими даними має FK на `Gym` (зал). Кастомний клас дозволів `IsGymStaff` автоматично фільтрує QuerySet по `gym_id` поточного користувача. Один сервер обслуговує необмежену кількість залів з повною ізоляцією даних.

**Критичний інваріант:** жоден QuerySet з клієнтськими даними не виконується без фільтра по `gym_id` авторизованого користувача. Покрито тестом `AdminAttendanceViewSetTests.test_attendance_gym_isolation`.

### 2. Fat services, skinny views

Бізнес-логіка винесена у `crm/services.py`. View-функції відповідають лише за HTTP-маршрутизацію і валідацію. Якщо функція визначає чи дозволено клієнту вхід (час, абонемент тощо) — їй місце у `services.py`, не у `views.py`.

### 3. Token Authentication

DRF Token Auth, без сесій. Заголовок `Authorization: Token <hash>` на кожен захищений запит. Stateless — підходить для мобільних клієнтів та web одночасно.

### 4. Append-only audit trail

Модель `Attendance` ніколи не редагується/не видаляється — лише `INSERT`. Кожна спроба входу (успішна або відхилена) фіксується разом з причиною відмови. У Django Admin `has_delete_permission=False`.

---

## 📂 Структура проекту

```
gym_project/
├── crm/                         # Єдиний Django-app, де живе вся логіка
│   ├── models.py                # 11 моделей (Gym, Member, Instructor,
│   │                            #            MembershipType/History,
│   │                            #            ClassSession, Booking,
│   │                            #            Attendance, Payment,
│   │                            #            MembershipApplication, etc.)
│   ├── views.py                 # Тонкі ViewSets/Views
│   ├── serializers.py           # DRF серіалізатори
│   ├── permissions.py           # IsGymStaff (multi-tenancy)
│   ├── services.py              # check_client_access() + helpers
│   ├── utils.py                 # get_gym_from_request()
│   ├── urls.py                  # Router + custom routes
│   ├── tests.py                 # 16 unit-тестів
│   ├── admin.py                 # Django Admin реєстрації
│   ├── migrations/              # Schema migrations
│   └── fixtures/
│       └── demo_data.json       # Демо-сід для розробки і захисту
│
├── gym_project/                 # Project settings + urls
│   ├── settings.py              # env-vars-driven config
│   └── urls.py                  # Top-level routes + Swagger
│
├── FITGIM-AI-MEMORY/            # 📚 База знань (Obsidian-сумісна)
│   ├── README.md                # Навігація бази знань
│   ├── 00_CORE_DIRECTIVES.md    # Принципи команди і Claude
│   ├── 01_SYSTEM_ARCHITECTURE.md
│   ├── 02_API_CONTRACTS.md
│   ├── 03_ACTIVE_STATE.md       # Поточний стан + журнал сесій
│   ├── 04_BACKLOG_&_IDEAS.md
│   ├── 05_KANBAN.md             # DONE / IN PROGRESS / BACKLOG
│   ├── 06_WEEKLY_SPRINT.md      # Роадмап до захисту 16-23.06
│   ├── 07_ARCHITECTURE_DIAGRAM.md
│   ├── 08_THESIS_ARCHITECTURE_SECTION.md
│   └── 09_THESIS_METHODOLOGY.md # Вижим вимог кафедри
│
├── requirements.txt
├── manage.py
└── db.sqlite3                   # Dev-only (планується PostgreSQL для prod)
```

---

## 🔑 Ключові ендпоінти

Повний контракт у `FITGIM-AI-MEMORY/02_API_CONTRACTS.md` + Swagger UI.

### Автентифікація
| Метод | URL | Опис |
|---|---|---|
| POST | `/api/login/` | Логін, повертає `{token}` |
| POST | `/api/register/` | Реєстрація (створює User + Member) |
| GET | `/api/me/` | Профіль поточного користувача |

### Публічні
| Метод | URL | Опис |
|---|---|---|
| GET | `/api/workouts/` | Категорії тренувань |
| GET | `/api/classes/` | Типи занять |
| GET | `/api/instructors/?gym_id=N` | Тренери залу |
| GET | `/api/membership-types/?gym_id=N` | Тарифи (з полями `time_limit_start/end`) |
| GET | `/api/schedule/?gym_id=N` | Розклад |
| POST | `/api/apply/` | Заявка з лендингу (лід) |

### Клієнт (Member, потребує токен)
| Метод | URL | Опис |
|---|---|---|
| GET | `/api/my-bookings/` | Свої бронювання |
| POST | `/api/book/` | Запис на заняття |
| DELETE | `/api/my-bookings/{id}/` | Скасування |

### Адмін (IsGymStaff, ізоляція по `gym_id`)
| Метод | URL | Опис |
|---|---|---|
| CRUD | `/api/admin/members/` | Клієнти зала |
| CRUD | `/api/admin/instructors/` | Тренери |
| CRUD | `/api/admin/schedule/` | Розклад |
| CRUD | `/api/admin/applications/` | Заявки з лендингу |
| GET | `/api/admin/attendance/` | Журнал відвідувань (read-only) |
| POST | `/api/admin/memberships/assign/` | Продати абонемент клієнту |

### QR Check-in (ядро системи)
| Метод | URL | Опис |
|---|---|---|
| POST | `/api/access/check/` | Перевірка доступу за `{member_id, gym_id}` |

Бізнес-логіка `check_client_access()` у `crm/services.py`:
1. Member існує в gym? → ні → 403 (без Attendance)
2. Активна `MembershipHistory`? → ні → 403 + Attendance
3. `time_limit_start/end` є? → перевірка часу у `gym.timezone` → 403 + Attendance
4. Всі пройшли → 200 + Attendance

---

## 🧪 Тестування

```bash
# Усі тести
python manage.py test crm

# Один тестовий клас
python manage.py test crm.tests.MeViewTests

# Один тест
python manage.py test crm.tests.MeViewTests.test_returns_member_profile
```

Поточне покриття — 16 тестів:
- `CheckClientAccessTests` — успіх + 4 причини відмови + часові межі
- `MeViewTests` — Member, Staff, неавтентифікований
- `MembershipAssignViewTests` — успіх + 404 + валідація
- `AdminAttendanceViewSetTests` — read-only + **gym isolation**

```
Ran 16 tests in 10.089s
OK
```

---

## 🛠️ Стек

| Шар | Технологія | Версія |
|---|---|---|
| Мова | Python | 3.12+ |
| Фреймворк | Django | 4.2 (target 5.x для prod) |
| API | Django REST Framework | 3.16 |
| Документація | drf-spectacular | 0.28 (OpenAPI 3 / Swagger UI) |
| БД (dev) | SQLite | — |
| БД (prod, planned) | PostgreSQL | — |
| Зображення | Pillow | 12 |
| CORS | django-cors-headers | 4 |
| Часові пояси | pytz | 2026.1 |

---

## 🗂️ Стандарти кодування

- **Type hints** обов'язкові на всіх сигнатурах функцій
- HTTP коди — DRF-константи `status.HTTP_*`, не магічні числа
- **Жодної бізнес-логіки у views/serializers** — все що визначає правила (доступ, валідність, експіри тощо) йде у `services.py`
- **Gym isolation:** кожна модель з клієнтськими даними має FK `gym`; у адмін-ендпоінтах `Model.objects.filter(gym=request.user.gym_id, ...)`

---

## 🚀 Roadmap

### Sprint 1 — Дипломна частина (до 16-23.06.2026)
- ✅ Технічна частина закрита (всі моделі, API, тести, Swagger)
- ⏳ Пояснювальна записка 75-100 стор за методичкою БФКПЕП
- ⏳ Графічна частина ≥5 креслень з рамкою ЕСКД
- ⏳ Презентація + репетиція

Детальний план — `FITGIM-AI-MEMORY/06_WEEKLY_SPRINT.md`.

### Sprint 2 — MVP-продукт (після захисту)
- PostgreSQL міграція
- LiqPay / WayForPay інтеграція
- Push-сповіщення (Expo Notifications + backend trigger)
- Rate limiting на `/api/login/`
- Self-service реєстрація залу

### Sprint 3 — Захоплення ринку
- White-label
- Telegram bot
- Monobank API
- Мультимовність (UA / EN / RU)
- Аналітика для мережі залів

---

## 📚 Внутрішня документація

Уся проектна пам'ять у **`FITGIM-AI-MEMORY/`** — це Obsidian-сумісна база знань:

| Файл | Призначення |
|---|---|
| `README.md` | Навігація + правила команди |
| `00_CORE_DIRECTIVES.md` | Принципи роботи команди + Claude |
| `01_SYSTEM_ARCHITECTURE.md` | Системна архітектура (контракт між компонентами) |
| `02_API_CONTRACTS.md` | Усі ендпоінти, формат запитів/відповідей |
| `03_ACTIVE_STATE.md` | Що зроблено, що в роботі, журнал сесій |
| `04_BACKLOG_&_IDEAS.md` | Ідеї на майбутнє |
| `05_KANBAN.md` | DONE / IN PROGRESS / BACKLOG |
| `06_WEEKLY_SPRINT.md` | Роадмап до 16-23.06 |
| `07_ARCHITECTURE_DIAGRAM.md` | Mermaid: системна, ER, sequence-діаграми |
| `08_THESIS_ARCHITECTURE_SECTION.md` | Готовий текст архітектурного розділу |
| `09_THESIS_METHODOLOGY.md` | Вижим вимог кафедри БФКПЕП |

**Правило:** перед складними змінами читай актуальний стан у `03_ACTIVE_STATE.md`. Після значних змін — оновлюй журнал сесій там.

---

## 👥 Команда

| Роль | Хто | Фокус |
|---|---|---|
| Backend Lead | **Рясний Олександр Григорійович** | Django, REST API, multi-tenancy, тести |
| Mobile / Frontend | **Товстуха Поліна Іванівна** | React Native, лендинг, UI/UX |
| Науковий керівник | **Гіневська Наталія Миколаївна** | Голова циклової комісії 121, БФКПЕП |

---

## 📄 Ліцензія

Внутрішній проект для дипломної роботи. Реальне використання — за домовленістю.

---

*Бердичівський фаховий коледж промисловості, економіки та права · Спеціальність 121 «Інженерія програмного забезпечення» · 2026*
