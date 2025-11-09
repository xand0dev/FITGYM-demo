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

// Імпорт нового модуля ІМТ-калькулятора
import { setupImtCalculator } from './modules/calculator.js'; // ⬅️ Імпорт

/* === INIT (Ініціалізація) === */
document.addEventListener('DOMContentLoaded', () => {

    // 1. Ініціалізація UI
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true
        });
    }
    initModalLogic(); 
    setupSmoothScrolling();
    setupHamburger();

    // 2. Автентифікація (форми та хедер)
    updateAuthArea(); 
    initAuth(); 

    // 3. Завантаження контенту
    populateTrainers(); 
    populatePlans();   
    
    // 💥 4. ІНІЦІАЛІЗАЦІЯ КАЛЬКУЛЯТОРА ІМТ
    setupImtCalculator(); 

    // 5. Відгуки
    populateReviews();
    setupReviewForm();

    // 6. Календар
    if (typeof FullCalendar !== 'undefined') {
        initCalendar();
    } else {
        console.error("FullCalendar не завантажено!");
    }
    
});