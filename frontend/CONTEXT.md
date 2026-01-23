# Контекст розробки FITGYM

## Архітектурні правила

1. **Стилі:** Ми використовуємо старі глобальні CSS файли з папки `/public/css`. Не використовуй CSS Modules, якщо це не критично.
2. **Модалки:** Всі глобальні модалки (Login, Register) керуються через `UIContext`. Не створюй локальні state для них.
3. **API:** Всі запити йдуть через `utils/api.js`.
   - `publicRequest` - для публічних даних.
   - `authRequest` - для захищених (автоматично додає токен).
4. **Router:** Використовуємо `react-router-dom`. `Layout` обгортає основні сторінки, `AdminPanel` живе окремо.

## Стан (State Management)

- **AuthContext:** `user` (об'єкт), `login()`, `logout()`, `loading`.
- **Локальний стейт:** Використовуємо `useState` для форм та UI елементів.

## Стек

- Vite, React, FullCalendar, AOS (анімації).
