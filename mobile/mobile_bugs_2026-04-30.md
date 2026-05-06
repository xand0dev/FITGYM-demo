# Mobile App — Bug Log

> Тестування Expo web на `localhost:8081`.
> Дата старту: 2026-04-30 (четвер).
> Тестер: Олександр (через Claude).

---

## ✅ FIXED

### #1a — `expo-secure-store` ламає всі API-запити на web (FIRST PASS)
**Severity:** Critical (блокує логін)
**Платформа:** web (`expo start --web`)
**Симптом:** Логін з валідними credentials мовчки нічого не робить. У console:
```
ExpoSecureStore.default.getValueWithKeyAsync is not a function
ExpoSecureStore.default.setValueWithKeyAsync is not a function
```
**Причина:** axios interceptor у `src/api/client.js` викликає `SecureStore.getItemAsync('userToken')` перед кожним запитом. На web `expo-secure-store` не має реалізації цих методів — interceptor кидає виняток → axios скасовує запит → бек нічого не отримує. Те саме у `useAppStore.js` (checkToken, login, logout, тощо).
**Фікс:** створено `src/utils/storage.js` — обгортка яка на native використовує SecureStore, на web — localStorage. Замінено імпорти в `client.js` і `useAppStore.js`.
**Комміт:** `fix(mobile): cross-platform storage wrapper for web compatibility`

---

### #1b — `expo-secure-store` у решті файлів (SECOND PASS)
**Severity:** Critical (логаут, гідратація з історією, погружено-вивантаження ваги, AchievementsScreen, HIITTimer тощо)
**Симптом:** Перший фікс торкнувся тільки `client.js` + `useAppStore.js`, але SecureStore імпортується ще у 6 інших файлах. На web ці екрани мовчки фейлять.
**Знайдено грепом:** `AchievementsScreen.js`, `HIITTimer.js`, `EducationScreen.js`, `CabinetScreen.js` (для аватара), `HomeScreen.js`, `weightStorage.js`.
**Фікс:** замінено всі імпорти на `import SecureStore from '../utils/storage'` (для weightStorage.js — `'./storage'`).

---

## 🐛 OPEN

### #2 — Аватар у Кабінеті показує "U" замість першої літери юзера
**Severity:** Minor (косметика)
**Платформа:** web (можливо й native)
**Симптом:** На екрані Кабінет аватар показує літеру **"U"** для юзера `legion` — має бути **"L"**.
**Причина:** Імовірно у `CabinetScreen.js` хардкоднута літера "U" (User?) замість `username[0].toUpperCase()` або з `user.full_name`.
**Файл:** `fitgym-app/src/screens/CabinetScreen.js`

---

### #3 — Всі тарифи показують "БЕЗЛІМ" — навіть time-limited
**Severity:** Major (вводить клієнта в оману)
**Платформа:** web + native (баг у компоненті)
**Симптом:** На `MembershipScreen` всі картки тарифів мають бейдж `N МІСЯЦІВ БЕЗЛІМ`. Тариф **"Ранковий"** має `time_limit_start=06:00, time_limit_end=13:00` (працює лише до 13:00) — але показує "БЕЗЛІМ" як і повний тариф.
**Причина:** Лейбл `БЕЗЛІМ` хардкодиться, не залежить від `time_limit_start/end` з API.
**Очікувано:**
- Якщо `time_limit_start` і `time_limit_end` обидва `null` → "БЕЗЛІМ"
- Якщо є time_limit → показувати `06:00-13:00` або "Ранковий доступ"
**Файл:** `fitgym-app/src/screens/MembershipScreen.js`

---

### #4 — Тарифи не фільтруються по gym
**Severity:** Major (multi-tenancy gap)
**Симптом:** На `MembershipScreen` дублі тарифів — однаковий "Повний" 1 МІСЯЦЬ 2000₴ показано двічі (для різних gym). Юзер бачить чужі.
**Причина:** Запит до `/api/membership-types/` без фільтра `?gym_id=`. Бек публічний ендпоінт, повертає всі.
**Фікс:** додати `?gym_id=${user.gym_id}` у виклик.
**Файл:** `fitgym-app/src/screens/MembershipScreen.js`

---

### #5 — AI Coach: текст у відповіді не переноситься на широкому екрані
**Severity:** Major (на web ламає UX)
**Платформа:** web (на native не репродукується)
**Симптом:** Відповідь Gemini виходить за межі вікна горизонтально, обрізається. На скріні: "...бадьорість та вп" — обрив посередині слова "впевненість" (?).
**Причина:** У стилях message-bubble відсутній `maxWidth: '80%'` (або подібне). На native ширина екрану 390px і текст переноситься природно — на web без обмеження bubble тягнеться на всю ширину контейнера.
**Файл:** `fitgym-app/src/screens/AICoachScreen.js`

---

### #6 — QR Pass для адміна містить null member_id/gym_id
**Severity:** Minor (edge case — адмін зазвичай не сканується)
**Симптом:** На `GymPassScreen` для юзера-адміна (`legion`, `is_staff=true`) генерується QR з даними `{member_id: null, gym_id: null}`. Сканер відмовить з причиною "Клієнт не знайдений".
**Причина:** Скрін показується для всіх ролей; адмін не має профілю Member, тому `member_id=null`.
**Очікувано:** для юзерів без `member_id` показувати повідомлення "Перепустка доступна тільки клієнтам клубу" замість QR.
**Файл:** `fitgym-app/src/screens/GymPassScreen.js`

---

### #8 — `Alert.alert` для confirmation на web — мовчазний no-op
**Severity:** Critical (логаут не працює, скасування записів не працює, інші critical UX)
**Симптом:** На web кліки на критичні кнопки (Логаут, Скасувати запис, Зміна аватара) нічого не роблять — бо `Alert.alert` з кнопками confirm/cancel на web є no-op (повертає `undefined` без рендеру).
**Знайдено в:** `CabinetScreen.js:345` (логаут), `:55-67` (скасування запису), `:71-78` (вибір фото). Можливо ще у `useAppStore.js:199` (помилка входу).
**Фікс (варіанти):**
1. Простий: на web замість `Alert.alert` показувати кастомний modal-toast (можна використати існуючий `addToast` з UIContext, або зробити `confirm()` обгортку).
2. Швидкий хак: на web замість `Alert.alert(...)` викликати `window.confirm('...') ? onPress() : null`.
3. Краще: створити `src/utils/dialog.js` що абстрагує `Alert.alert` → web modal.

---

### #7 — Розклад починається з завтрашнього дня, не з сьогодні
**Severity:** Trivial (UX preference)
**Симптом:** Сьогодні 06.05 (середа). Дата-стрічка на екрані Тренування → Розклад починається з **чт 7** (завтра), а не з сьогодні. Сьогоднішні заняття приховані — навіть якщо вечірні ще будуть.
**Файл:** `fitgym-app/src/screens/WorkoutsScreen.js` (або компонент календарної стрічки)


---

## ⚠️ Версії пакетів — попередження від Expo

Expo doctor скаржиться на mismatch:
```
expo@54.0.33 → ~54.0.34
expo-haptics@55.0.9 → ~15.0.8
expo-image-picker@17.0.10 → ~17.0.11
expo-linear-gradient@55.0.9 → ~15.0.8
expo-notifications@55.0.13 → ~0.32.17
babel-preset-expo@55.0.12 → ~54.0.10
jest-expo@55.0.9 → ~54.0.17
```
**Дія:** не блокує, але перед релізом запустити `npx expo install --fix`.
