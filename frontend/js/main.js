/* ===========================
   main.js — "Диригент" сайту FITGYM
   =========================== */

// 1. Імпортуємо UI-функції (тости, модалки, скрол, гамбургер)
import {
    initModalLogic,
    setupSmoothScrolling,
    setupHamburger
} from './modules/ui.js';

// 2. Імпортуємо логіку Автентифікації (форми, оновлення хедера)
import {
    initAuth,
    updateAuthArea
} from './modules/auth.js';

// 3. Імпортуємо логіку Контенту (тренери, абонементи)
import {
    populateTrainers,
    populatePlans
} from './modules/content.js';

// 4. Імпортуємо логіку Відгуків
import {
    populateReviews,
    setupReviewForm
} from './modules/reviews.js';

// 5. Імпортуємо логіку Календаря
import { initCalendar } from './modules/calendar.js';

// 6. Імпортуємо логіку ІМТ-калькулятора
import { setupImtCalculator } from './modules/calculator.js'; 


/* =========================================
   INIT (Ініціалізація, виконується після завантаження DOM)
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {

    // 1. UI та Анімація
    // Ініціалізація AOS (якщо бібліотека завантажена)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true
        });
    }
    initModalLogic();         // Логіка модальних вікон
    setupSmoothScrolling();   // Плавний скрол до секцій
    setupHamburger();         // Меню-гамбургер

    // 2. Автентифікація
    updateAuthArea();         // Оновлення хедера (Вхід/Кабінет)
    initAuth();               // Обробка форм входу/реєстрації

    // 3. Контент
    populateTrainers();       // Завантаження карток тренерів
    populatePlans();          // Завантаження абонементів
    
    // 4. Функціональні модулі
    setupImtCalculator();     // ІМТ-калькулятор
    
    // 5. Відгуки
    populateReviews();        // Завантаження і відображення відгуків
    setupReviewForm();        // Обробка форми відгуку

    // 6. Розклад (Calendar)
    if (typeof FullCalendar !== 'undefined') {
        initCalendar();       // Ініціалізація FullCalendar
    } else {
        // Виводимо помилку, якщо FullCalendar не завантажено
        console.error("Помилка: FullCalendar не завантажено або недоступний.");
    }
    
});