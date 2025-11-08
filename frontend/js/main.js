/* ===========================
   main.js — "Диригент" сайту FITGYM
   =========================== */

// Імпортуємо UI-функції (тости, модалки, скрол)
import {
    initModalLogic,
    setupSmoothScrolling,
    setupHamburger
} from './modules/ui.js';

// Імпортуємо логіку Автентифікації (форми, оновлення хедера)
import {
    initAuth,
    updateAuthArea
} from './modules/auth.js';

// Імпортуємо логіку Контенту (тренери, абонементи)
import {
    populateTrainers,
    populatePlans
} from './modules/content.js';

// Імпортуємо логіку Відгуків
import {
    populateReviews,
    setupReviewForm
} from './modules/reviews.js';

// Імпортуємо логіку Календаря
import { initCalendar } from './modules/calendar.js';

/* === INIT (Ініціалізація) === */
document.addEventListener('DOMContentLoaded', () => {

    // 1. Ініціалізація UI
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true
        });
    }
    initModalLogic(); // Налаштовує кнопки закриття модалок
    setupSmoothScrolling();
    setupHamburger();

    // 2. Автентифікація (форми та хедер)
    updateAuthArea(); // Оновлює хедер (Привіт, ... / Вхід)
    initAuth(); // Налаштовує слухачі форм (loginForm, registerForm)

    // 3. Завантаження контенту
    populateTrainers(); // Завантажує тренерів з API
    populatePlans();    // Завантажує абонементи з API

    // 4. Відгуки
    populateReviews();
    setupReviewForm();

    // 5. Календар
    if (typeof FullCalendar !== 'undefined') {
        initCalendar();
    } else {
        console.error("FullCalendar не завантажено!");
    }
});