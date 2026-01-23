# FITGYM - Frontend (React)

Веб-додаток для мережі фітнес-клубів.
Переписано з ванільного HTML/JS на React + Vite.

## 🛠 Технології

- **React 18** (Vite)
- **React Router** (SPA навігація)
- **FullCalendar** (Розклад)
- **Context API** (State Management)
- **CSS Modules / Global CSS** (Адаптація старих стилів)

## 📂 Структура проєкту

- `/src/components` - Перевикористовувані частини (Header, Footer, Modals).
- `/src/pages` - Повноцінні сторінки (Home, Cabinet, Admin).
- `/src/context` - Глобальний стан (AuthContext, UIContext).
- `/src/utils` - Хелпери (API запити).
- `/public` - Статичні файли (картинки, глобальні CSS).

## 🚀 Як запустити

1. `npm install`
2. `npm run dev`

## 🔑 Ключові особливості

- **AuthContext**: Зберігає токен користувача та перевіряє права (Admin/User).
- **UIContext**: Керує глобальними модалками (Вхід/Реєстрація).
- **Admin Panel**: Окрема захищена зона (`/admin`) з вкладками.
