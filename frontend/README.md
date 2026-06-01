# FITGYM Frontend

> React 19 + Vite веб-застосунок FITGYM:
> 🌐 публічний лендинг, 👤 особистий кабінет клієнта, 🛡️ адмін-панель для персоналу.

[![React](https://img.shields.io/badge/React-19-61dafb)]() [![Vite](https://img.shields.io/badge/Vite-6-646cff)]() [![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8)]() [![TanStack_Query](https://img.shields.io/badge/TanStack_Query-5-ef4444)]()

---

## 📍 Це частина монорепо FITGYM

| Репо | Призначення |
|---|---|
| FITGYM-backend | Django + DRF REST API |
| **FITGYM-frontend** (цей репо) | React + Vite веб-адмінка + лендинг |
| FITGYM-mobile | React Native + Expo застосунок клієнтів |

Усі дані тягне з REST API бекенду на `http://localhost:8000/api/`.

---

## ⚡ Швидкий старт

```bash
npm install
npm run dev          # dev server: http://localhost:5173
npm run build        # production build
npm run lint         # ESLint
npm run preview      # перегляд продакшн-білда локально
```

**Залежно від наявності бекенду** на `:8000`:
- ✅ Якщо бек запущено — лендинг показує реальні тарифи, розклад, тренерів
- ❌ Якщо ні — фронт працює але буде показувати помилки завантаження

Базовий URL API налаштовано у `src/utils/api.js` (`BASE_URL = 'http://127.0.0.1:8000'`).

---

## 🏗️ Архітектура

### Маршрути

| URL | Сторінка | Доступ |
|---|---|---|
| `/` | Лендинг (Hero, Тарифи, Тренери, Розклад, BMI, Контакти) | публічний |
| `/cabinet` | Особистий кабінет клієнта | `PrivateRoute` (auth) |
| `/admin` | Адмін-панель (Dashboard, QR Scanner, Розклад, Клієнти, Журнал, Заявки, Тренери) | `PrivateRoute adminOnly` |
| `/register-gym` | Self-service реєстрація нового залу (3-section wizard) | публічний |

### Управління станом
- **Сервер:** TanStack Query 5 через `useFitQuery`/`useFitMutation`/`useAuthData` (`src/hooks/useFitQuery.js`)
- **Клієнт:** React Context — `AuthContext` (токен + user identity), `UIContext` (модалки, toast)

### Дизайн-система
- **Фон:** `#080808` (deep black)
- **Акцент:** `#cc0000` / `#ff0000` (primary)
- **Шрифти:** Bebas Neue (display), Oswald (heading), Inter (body)
- **Ефекти:** glassmorphism (`GlassCard`), red glow, dark inverted maps

---

## 📂 Структура

```
src/
├── pages/
│   ├── Home.jsx                # Лендинг
│   ├── Cabinet.jsx             # Профіль клієнта
│   ├── AdminPanel.jsx          # Адмінка (контейнер табів)
│   ├── GymRegister.jsx         # Self-service реєстрація залу
│   └── NotFound.jsx
│
├── components/
│   ├── admin/                  # CRUD таби для адмінки
│   │   ├── DashboardTab.jsx    # 📊 Live аналітика з Recharts
│   │   ├── QRScannerTab.jsx    # 📷 Webcam + jsQR + /api/access/check/
│   │   ├── ScheduleTab.jsx
│   │   ├── ClientsTab.jsx
│   │   ├── TrainersTab.jsx
│   │   ├── ApplicationsTab.jsx
│   │   ├── AttendanceTab.jsx
│   │   ├── AdminSidebar.jsx
│   │   └── AdminTopbar.jsx
│   ├── home/                   # Секції лендингу
│   ├── cabinet/                # Компоненти кабінету
│   ├── auth/                   # Login/Register modals
│   ├── ui/                     # GlassCard, Toast, ConfirmModal
│   └── layout/                 # Layout, Header, Footer
│
├── context/                    # AuthContext, UIContext
├── hooks/                      # useFitQuery, useFitMutation, useAuthData
├── utils/                      # api.js (BASE_URL + getToken)
└── lib/                        # cn() для tailwind merge
```

---

## 🔥 Ключові функції адмін-панелі

### 📊 Live Dashboard
- 4 метрики: активні клієнти, виручка місяця, нові підписки, зараз у залі
- 5 графіків Recharts: відвідуваність 7 днів, популярні напрямки, пікові години, revenue 6 місяців, останні події
- Усе з реального API `/api/admin/analytics/` через `useAuthData`

### 📷 QR Scanner
- Камера через `navigator.mediaDevices.getUserMedia()`
- Декодер: `jsQR` у браузері (без сервера)
- Cooldown 2.5с між однаковими QR
- Зелений/червоний overlay на 1.8с з причиною
- Список 10 останніх сканувань збоку

### 🏢 Self-service Gym Registration
- 3 секції форми (про зал → власник → доступ)
- Транзакційне створення Gym + User(staff) + 3 дефолтні тарифи
- Автологін після успіху → редірект на `/admin`

---

## 🛠️ Стек

| Шар | Технологія | Версія |
|---|---|---|
| UI Framework | React | 19 |
| Build tool | Vite | 6 |
| Стилізація | Tailwind CSS | 3 |
| Server state | TanStack Query | 5 |
| Routing | React Router | 6 |
| Графіки | Recharts | 2 |
| Анімації | Framer Motion | 11 |
| Іконки | Lucide React | — |
| QR декодер | jsQR | — |
| Календар | FullCalendar | 6 |

---

## 🎨 Стандарти кодування

- **Функціональні компоненти** з хуками
- **Стилізація через Tailwind**; custom-classes мінімально (тільки у `<style>` для анімацій)
- **API виклики через хуки**, не fetch напряму:
  - `useAuthData(key, endpoint)` для GET з токеном
  - `useFitMutation(method)` для POST/PUT/DELETE
- **Toast замість alert():** `useUI().addToast(message, type)`

---

## 🚀 Production build

```bash
npm run build
# → dist/  готовий для деплою на CDN / Nginx
```

Розмір бандла ~1.4 MB (gzipped ~425 KB).

---

## 👥 Команда

| Роль | Хто |
|---|---|
| Backend / Tech Lead | Рясний Олександр Григорійович |
| Mobile / Frontend | Товстуха Поліна Іванівна |
| Науковий керівник | Гіневська Наталія Миколаївна |

*Бердичівський фаховий коледж промисловості, економіки та права · Спеціальність 121 · 2026*
