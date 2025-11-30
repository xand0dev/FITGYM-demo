/* ===========================
   main.js — Entry Point (Точка входу)
   ---------------------------
   Цей файл збирає всі модулі докупи і запускає їх.
   Також він "експортує" важливі функції у window,
   щоб HTML (onclick attributes) міг їх бачити.
   =========================== */

// 1. IMPORT (Підключаємо всі запчастини)
import {
    initModalLogic,
    setupSmoothScrolling,
    setupHamburger,
    openModal,       // <--- Критично важливо
    closeModal,      // <--- Критично важливо
    closeAllModals
} from './modules/ui.js';

import {
    initAuth,
    updateAuthArea
} from './modules/auth.js';

import {
    populateTrainers,
    populatePlans
} from './modules/content.js';

import {
    populateReviews,
    setupReviewForm
} from './modules/reviews.js';

import { setupImtCalculator } from './modules/calculator.js';
import { initCarousel } from './modules/carousel.js';
import { initCalendar } from './modules/calendar.js';

/* =========================================
   GLOBAL EXPORTS (GLUE LAYER)
   -----------------------------------------
   Оскільки type="module" має свою ізольовану область видимості,
   змінні звідси не видно в HTML атрибутах (onclick).
   Ми вручну додаємо їх в глобальний об'єкт window.
   ========================================= */
window.openModal = openModal;
window.closeModal = closeModal;
window.closeAllModals = closeAllModals;


/* =========================================
   APP INITIALIZATION
   -----------------------------------------
   Виконується, коли браузер завантажив HTML (DOM).
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 FITGYM System Starting...');

    // 1. UI LAYER (Інтерфейс)
    initModalLogic();         // Кнопки закриття, клік по фону
    setupHamburger();         // Мобільне меню
    setupSmoothScrolling();   // Якірні посилання

    // AOS (Animate On Scroll) - бібліотека анімацій
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, once: true });
    }

    // 2. AUTH LAYER (Автентифікація)
    updateAuthArea();         // Перевіряємо токен, малюємо "Вхід" або "Кабінет"
    initAuth();               // Вішаємо обробники на форми (Login/Register)

    // 3. CONTENT LAYER (Дані)
    populateTrainers();       // Завантажуємо тренерів (або фейкові дані)
    populatePlans();          // Завантажуємо ціни

    // 4. FUNCTIONAL MODULES (Фічі)
    setupImtCalculator();     // Калькулятор маси тіла
    initCarousel();           // Слайдер фотографій

    // 5. REVIEWS (Відгуки)
    populateReviews();        // Список відгуків
    setupReviewForm();        // Форма додавання

    // 6. CALENDAR (Розклад)
    if (typeof FullCalendar !== 'undefined') {
        initCalendar();
    } else {
        console.warn('⚠️ FullCalendar library not found. Schedule disabled.');
    }

    console.log('✅ FITGYM Initialized Successfully.');
});