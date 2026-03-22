# 🏋️‍♂️ FITGYM Mobile App

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Zustand](https://img.shields.io/badge/Zustand-Bear-brown?style=for-the-badge)](https://github.com/pmndrs/zustand)
[![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)

FITGYM — це сучасний, високопродуктивний мобільний застосунок преміум-класу для екосистеми фітнес-клубів. Розроблений з акцентом на **Offline-to-Online (O2O)** взаємодію, додаток поєднує в собі глибоку інтеграцію з REST API, смарт-бронювання, штучний інтелект та гейміфікацію для максимального залучення користувачів (Retention Rate).

---

## 🌟 Ключовий Функціонал & Архітектурні Рішення

### 🏛 Архітектура та Стан (State Management)
- **Zustand & SecureStore:** Глобальний стейт-менеджмент реалізовано через `zustand` з персистентним рівнем (persistent storage) на базі `expo-secure-store`. Це забезпечує миттєве відновлення користувацьких сесій, історії ШІ-чатів та кешування стріків (Streaks) навіть після холодного перезапуску.
- **Complex Routing:** Багаторівнева навігаційна система (Auth Stack, Bottom Tabs, Modals) побудована на `@react-navigation/native`, що розділяє логіку авторизованих та неавторизованих користувачів.

### 🛡 Безпека та Валідація
- **JWT Інтеграція:** Комунікація з бекендом (Django REST Framework) захищена Bearer-токенами за допомогою axios-інтерцепторів.
- **Strict Forms:** Всі форми (вхід, реєстрація) контролюються через `react-hook-form` у зв'язці зі схемною валідацією `yup` (email regex, перевірка збігу паролів, обов'язкові поля).

### 🤖 Інтеграція Штучного Інтелекту
- Вбудованый **AI Fitness Coach**, що працює на базі `Google Gemini 2.5 Flash API`.
- Підтримка контекстних діалогів: ШІ запам'ятовує обрану користувачем фітнес-ціль (Схуднення/Маса) та використовує її як системний промпт для генерації персоналізованих порад.
- Анімований Typewriter-UI для імітації "живого" спілкування.

### 📱 Premium Native UX
- **Haptic Feedback:** Інтеграція `expo-haptics` створює тактильний супровід для всіх мікроінтеракцій (від вибору дати в календарі до успішної симуляції Apple Pay).
- **Skeleton Views:** Акуратні пульсуючі лоадери замість класичних спінерів для безшовного UX під час очікування відповіді API.
- **O2O Check-in:** Динамічна генерація QR-кодів клубних карток (`react-native-qrcode-svg`) з анімаціями пульсації для пропуску через турнікети клубу.

---

## 🗓 Реалізація Роботи з Даними (Data Flow)

- **Фільтрація та Пагінація:** Спеціалізований горизонтальний скролл-календар для `WorkoutsScreen`, який локально сортує та відфільтровує розклад занять (отриманих з `/api/schedule/`) за вибраним днем, виключаючи минулі тренування.
- **Динамічний UI Мутатор:** Налаштування тем (Dark/Light) та глобальної акцентної генерації кольорів (Accent Color Picker) розповсюджується на всі компоненти миттєво через Zustand.

---

## 🛠 Технологічний Стек

| Категорія | Технології |
| :--- | :--- |
| **Mobile Framework** | React Native (v0.74+), Expo SDK 51 |
| **State Management** | Zustand |
| **Networking** | Axios (Custom Client & Interceptors) |
| **Forms & Schema** | React Hook Form, Yup |
| **Local Storage** | Expo Secure Store, AsyncStorage |
| **Testing** | Jest, Jest-Expo |
| **Native API** | ImagePicker, Haptics, Notifications |

---

## 🚀 Встановлення та Розгортання (Setup)

Додаток налаштований для швидкого запуску в середовищі розробки.

1. **Клонування та залежності:**
   ```bash
   git clone <repository_url>
   cd fitgym-app
   npm install
   ```

2. **Налаштування середовища (Environment Variables):**
   Створіть файл `.env` у корені проекту та додайте ключі доступу:
   ```env
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Конфігурація Бекенду:**
   У файлі `src/api/client.js` вкажіть IPv4 адресу вашого локального комп'ютера (де запущено Django-сервер):
   ```javascript
   baseURL: 'http://192.168.1.100:8000/api',
   ```

4. **Запуск сервера розробки Expo:**
   ```bash
   npx expo start --clear
   ```

---

## 🧪 Тестування (Quality Assurance)

Проект дотримується принципів TDD (клієнтська частина) для перевірки критичної бізнес-логіки. Написано покриття для форматувальників та парсерів, які опрацьовують вхідні дані з сервера (наприклад, правильна граматика українських числівників для абонементів).

Для запуску юніт-тестів:
```bash
npm run test
```

*Expected output: 5 passing tests (Formatters Utilities).*

---
*Документація підготовлена для фінального захисту навчального/дипломного проекту.* 🎓
