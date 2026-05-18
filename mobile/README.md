# FITGYM Mobile

> React Native + Expo SDK 54 застосунок клієнтів фітнес-клубу FITGYM.
> Працює на Android, iOS і в браузері (web-mode).

[![Expo SDK](https://img.shields.io/badge/Expo_SDK-54-000020)]() [![React_Native](https://img.shields.io/badge/RN-0.76-61dafb)]() [![Zustand](https://img.shields.io/badge/State-Zustand-orange)]() [![Tests](https://img.shields.io/badge/Mobile_bugs-9%2F9_fixed-brightgreen)]()

---

## 📍 Це частина монорепо FITGYM

| Репо | Призначення |
|---|---|
| FITGYM-backend | Django + DRF REST API |
| FITGYM-frontend | React + Vite веб-адмінка + лендинг |
| **FITGYM-mobile** (цей репо) | React Native + Expo застосунок клієнтів |

Тягне дані з REST API бекенду (`.env: EXPO_PUBLIC_API_URL`).

---

## ⚡ Швидкий старт

```bash
npm install
cp .env.example .env       # встав свій API_URL + GEMINI_API_KEY

npx expo start             # → QR + меню (a=Android, w=web)
npx expo start --android   # одразу на Android emulator
npx expo start --web       # у браузері (http://localhost:8081)
npm test                   # Jest тести
```

Стандартний `EXPO_PUBLIC_API_URL`:
- **Android emulator:** `http://10.0.2.2:8000/api`
- **iOS simulator / Web:** `http://localhost:8000/api`
- **Реальний телефон:** `http://<IP_твого_ПК>:8000/api` (`192.168.X.X`)

---

## 🏗️ Архітектура

### Управління станом
- **Глобальний:** Zustand store (`src/store/useAppStore.js`)
- **Персистентність:** Expo SecureStore на native, localStorage на web (через `src/utils/storage.js`)
- **HTTP:** Axios з token-interceptor (`src/api/client.js`)

### Навігація
React Navigation 7, два кореневих стеки:
- **Auth Stack:** Onboarding (4 слайди) → Login / Register
- **Main Stack:** Tab Navigator (Головна, Тренування, Інструменти, Довідник, Кабінет) + 9 модальних екранів

### Cross-platform compat
Власні обгортки замість прямих API:
- `src/utils/storage.js` — SecureStore (native) / localStorage (web)
- `src/utils/dialog.js` — `Alert.alert` (native) / `window.confirm` (web)
- `src/utils/weightStorage.js` — журнал ваги через ту ж обгортку

---

## 📂 Структура

```
src/
├── api/
│   └── client.js                # Axios з token-interceptor
│
├── screens/                     # 17 екранів
│   ├── OnboardingScreen.js      # 4 слайди + вибір фітнес-цілі
│   ├── LoginScreen.js
│   ├── RegisterScreen.js
│   ├── HomeScreen.js            # 🏠 Cards + гідратація + Твоя Вага
│   ├── WorkoutsScreen.js        # 🏋️ Розклад + бронювання
│   ├── ToolsScreen.js           # 🧮 BMI, КБЖУ, 1РМ калькулятори
│   ├── EducationScreen.js       # 📚 Довідник + Стрічка
│   ├── CabinetScreen.js         # 👤 Профіль + Telegram link + теми
│   ├── ProgressScreen.js
│   ├── MembershipScreen.js      # 💳 Тарифи + LiqPay sandbox checkout
│   ├── GymPassScreen.js         # 🎫 Динамічна QR-перепустка
│   ├── ScannerScreen.js         # 📷 QR scanner для ресепшн (mobile-only)
│   ├── AICoachScreen.js         # 🤖 Gemini 2.5 Flash чат
│   ├── ClassDetailsScreen.js
│   ├── ActiveWorkoutScreen.js
│   ├── AchievementsScreen.js
│   └── FitCoinsShopScreen.js
│
├── store/
│   └── useAppStore.js           # Zustand з персистентністю
│
├── navigation/
│   └── AppNavigator.js          # Stack + Tabs
│
├── components/                  # HIITTimer, SkeletonLoader, тощо
├── constants/                   # theme, colors
└── utils/                       # storage, dialog, weightStorage, formatters
```

---

## 🔥 Ключові функціональні можливості

### 💳 LiqPay checkout (через WebView)
1. Клієнт обирає тариф → `POST /api/membership/checkout/init/`
2. Backend повертає LiqPay checkout URL
3. Mobile відкриває URL у `<WebView>` (sandbox-картка `4242 4242 4242 4242`)
4. На return URL → `POST /api/membership/checkout/confirm/`
5. Створюється `MembershipHistory` → success screen

### 🎫 QR Pass (GymPass)
- QR-код містить `{"member_id": 5, "gym_id": 1}` (динамічно з `useAppStore.user`)
- Для адмінів без member_id → показує «Доступно лише клієнтам клубу»

### 🤖 AI Coach (Gemini 2.5 Flash)
- Multi-turn history (зберігається у Zustand)
- Персоналізація під `fitnessGoal` + `streak`
- Streaming-like ефект "друкарської машинки"
- Ключ у `.env: EXPO_PUBLIC_GEMINI_API_KEY` (для демо є fallback)

### 📲 Telegram-бот прив'язка
- Cabinet → «Прив'язати Telegram» → `GET /api/me/telegram-code/`
- Backend генерує 6-значний код (10 хв TTL)
- Користувач у боті: `/link 123456` → акаунт прив'язано

---

## 🛠️ Стек

| Шар | Технологія | Версія |
|---|---|---|
| Framework | React Native | 0.76 |
| Build tool | Expo | SDK 54 |
| State | Zustand | 5 |
| Persistence | Expo SecureStore + localStorage fallback | — |
| Navigation | React Navigation | 7 (Stack + Tabs) |
| HTTP | Axios | 1.x |
| Forms | React Hook Form + Yup | — |
| Charts | react-native-chart-kit | — |
| Camera | expo-camera + jsQR | — |
| QR Generation | react-native-qrcode-svg | — |
| WebView | react-native-webview | 13.15 |
| AI | Google Gemini 2.5 Flash REST | — |

---

## 🐛 Web-compatibility fixes (9/9)

Знайдено + виправлено під час Playwright-тестування на web:

1. ~~`expo-secure-store` ламав login на web~~ — `src/utils/storage.js` обгортка
2. ~~Аватар показував `U` замість username initial~~ — fallback на `username`
3. ~~Всі тарифи показували «БЕЗЛІМ»~~ — backend + frontend форматер для `time_limit_*`
4. ~~Тарифи з усіх залів~~ — фільтр `?gym_id=`
5. ~~AI Coach текст не переносив на широкому екрані~~ — `flexShrink: 1`
6. ~~QR Pass показував `null` для адмінів~~ — admin guard
7. Розклад починається з сьогодні ✓
8. ~~`Alert.alert` мовчав на web~~ — `src/utils/dialog.js` з `window.confirm`
9. ~~«Invalid Date» на PRO MEMBER card~~ — `parseUkDate()` для DD.MM.YYYY

Деталі у `mobile_bugs_2026-04-30.md`.

---

## 🎨 Стандарти

- **Один-source-of-truth для теми:** `src/constants/theme.js`
- **Безпечні діалоги:** `import Alert from '../utils/dialog'` (не з react-native)
- **Безпечне сховище:** `import SecureStore from '../utils/storage'` (не з expo-secure-store)
- **Persistence у Zustand:** через `useAppStore.persist()` рендериться SecureStore/localStorage автоматично

---

## 🚀 Production build

```bash
npx eas build --platform android   # APK / AAB через EAS
npx eas build --platform ios       # потрібен Apple Developer account
```

Конфіг у `eas.json`. Запитати API_URL з env при білді.

---

## 👥 Команда

| Роль | Хто |
|---|---|
| Mobile / Frontend | Товстуха Поліна Іванівна |
| Backend / Tech Lead | Рясний Олександр Григорійович |
| Науковий керівник | Гіневська Наталія Миколаївна |

*Бердичівський фаховий коледж промисловості, економіки та права · Спеціальність 121 · 2026*
