# Changelog — FITGYM Mobile (Expo / React Native)

Формат за [Keep a Changelog](https://keepachangelog.com/uk/1.0.0/),
версіонування — [SemVer](https://semver.org/lang/uk/).

## [1.1.0] — 2026-05-19

### Added
- Реєстрація Expo push-токена на бекенді: `registerForPushNotificationsAsync()`
  у `src/utils/notifications.js` (дозволи + `getExpoPushTokenAsync` +
  `POST /me/device-token/`), виклик після login / відновлення сесії
  (`useAppStore.js`). Залежності: `expo-device`, `expo-constants`.

### TODO (Поліна)
- UI прийняття GymOwner invite-link (екран реєстрації по `/api/invites/<code>/`).

## [1.0.0] — 2026-05-14

Базовий застосунок: 17 екранів, auth (логін/реєстрація/онбординг),
розклад + бронювання, QR-перепустка та сканер, AI-тренер (Gemini 2.5 Flash),
LiqPay checkout через WebView, прив'язка Telegram, крос-платформна
веб-сумісність (storage/dialog wrappers).
