/**
 * js/modules/carousel.js - Логіка автоматичної каруселі з горизонтальною прокруткою
 */

let slideIndex = 0; 
let carouselWrapper; 
let slides;          
let slideWidth;      // Буде обчислена динамічно
let visibleSlidesCount = 0; // Кількість слайдів, видимих одночасно

/**
 * Оновлює позицію каруселі, застосовуючи CSS transform.
 */
function updateCarouselPosition() {
    if (!carouselWrapper) return;
    
    let offset = -slideIndex * slideWidth;
    carouselWrapper.style.transform = `translateX(${offset}px)`;
}

/**
 * Функція для автоматичного прокручування слайдів.
 */
function advanceSlide() {
    if (!carouselWrapper || slides.length === 0) return;

    // Якщо ми дійшли до останнього оригінального слайда, який видно
    // (slides.length - visibleSlidesCount) - це індекс першого слайда в останній групі
    if (slideIndex >= slides.length - visibleSlidesCount) {
        // Ми дійшли до клонованих слайдів. 
        // Потрібно "перестрибнути" на початок оригінального набору без анімації.
        
        carouselWrapper.style.transition = 'none'; // Вимикаємо анімацію
        slideIndex = 0; // Встановлюємо індекс на початок
        updateCarouselPosition(); // Застосовуємо зміщення
        
        // Після стрибка, відновлюємо анімацію і продовжуємо рух
        setTimeout(() => {
            carouselWrapper.style.transition = 'transform 0.5s ease-in-out'; // Вмикаємо анімацію назад
            slideIndex = 1; // Рухаємося до першого слайда після "стрибка"
            updateCarouselPosition();
            setTimeout(advanceSlide, 4000); // Продовжуємо цикл
        }, 50); // Мала затримка для того, щоб браузер "побачив" вимкнення transition
        
    } else {
        // Звичайний рух до наступного слайда
        slideIndex++;
        updateCarouselPosition();
        setTimeout(advanceSlide, 4000); // Прокручувати кожні 4 секунди
    }
}

/**
 * Ініціалізація каруселі.
 */
export function initCarousel() {
    carouselWrapper = document.querySelector(".js-carousel-wrapper");
    let originalSlides = document.querySelectorAll(".js-carousel-wrapper .carousel-slide");
    
    if (!carouselWrapper || originalSlides.length === 0) {
        console.warn('Карусель: не знайдено обгортку або слайди.');
        return;
    }

    // 1. Динамічне визначення ширини слайда
    const firstSlide = originalSlides[0];
    const style = getComputedStyle(firstSlide);
    const marginRight = parseFloat(style.marginRight);
    const marginLeft = parseFloat(style.marginLeft);
    slideWidth = firstSlide.offsetWidth + marginRight + marginLeft;
    
    // 2. Визначення кількості видимих слайдів
    const containerWidth = carouselWrapper.parentElement.offsetWidth; // Ширина батьківського контейнера
    visibleSlidesCount = Math.floor(containerWidth / slideWidth); 
    // Якщо контейнер маленький, переконаємося, що хоча б 1 слайд завжди видимий
    if (visibleSlidesCount === 0 && slideWidth > 0) visibleSlidesCount = 1;


    // 3. Клонування перших кількох слайдів для "нескінченної" прокрутки
    // Клонуємо достатньо слайдів, щоб заповнити "порожнє" місце, коли оригінальні слайди закінчаться
    for (let i = 0; i < visibleSlidesCount; i++) {
        if (originalSlides[i]) {
            const clone = originalSlides[i].cloneNode(true);
            carouselWrapper.appendChild(clone);
        }
    }
    
    // Оновлюємо список слайдів, щоб включити клони для коректної перевірки кінця
    slides = document.querySelectorAll(".js-carousel-wrapper .carousel-slide"); 

    // 4. Запускаємо прокручування
    slideIndex = 0; 
    updateCarouselPosition(); 
    setTimeout(advanceSlide, 4000); 
    console.log('Карусель з горизонтальною прокруткою ініціалізовано. Ширина слайда:', slideWidth, 'Видимих:', visibleSlidesCount);
}