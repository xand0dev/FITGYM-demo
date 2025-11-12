/**
 * js/modules/carousel.js - Логіка автоматичної каруселі з горизонтальною прокруткою
 */

let slideIndex = 0; 
let carouselWrapper; 
let slides; 
let slideWidth = 0; 
let visibleSlidesCount = 0; 

// Встановлюємо нову, швидшу швидкість прокручування (2 секунди)
const CAROUSEL_SPEED = 6000; 
const TRANSITION_DURATION = 50; 

/**
 * Оновлює позицію каруселі, застосовуючи CSS transform.
 */
function updateCarouselPosition() {
 if (!carouselWrapper || slideWidth === 0) return;

 let offset = -slideIndex * slideWidth;
 carouselWrapper.style.transform = `translateX(${offset}px)`;
}

/**
 * Функція для автоматичного прокручування слайдів.
 */
function advanceSlide() {
 if (!carouselWrapper || slides.length === 0) return;

 // Умова переходу: коли перший видимий слайд є клоном.
 if (slideIndex >= slides.length - visibleSlidesCount) {
 // 1. Різкий стрибок (без transition)
 carouselWrapper.style.transition = 'none';
 slideIndex = 0; 
 updateCarouselPosition(); 
 
  // 2. Після стрибка, відновлюємо анімацію і продовжуємо рух
 setTimeout(() => {
  carouselWrapper.style.transition = 'transform 0.5s ease-in-out'; // Вмикаємо анімацію назад
   slideIndex = 1; 
  updateCarouselPosition();
 setTimeout(advanceSlide, CAROUSEL_SPEED); // Продовжуємо цикл з новою швидкістю
 }, TRANSITION_DURATION); 
 
 } else {
// Звичайний рух до наступного слайда
slideIndex++;
 updateCarouselPosition();
 setTimeout(advanceSlide, CAROUSEL_SPEED); // Нова швидкість
 }
}

// Нова обгортка: Запускаємо ініціалізацію з невеликою затримкою
function startInitialization() {
    carouselWrapper = document.querySelector(".js-carousel-wrapper");
    let originalSlides = document.querySelectorAll(".js-carousel-wrapper .carousel-slide");
    
    if (!carouselWrapper || originalSlides.length === 0) {
 console.warn('Карусель: не знайдено обгортку або слайди.');
 return;
 }

 // 1. Динамічне визначення ширини слайда
 const firstSlide = originalSlides[0];
 const style = getComputedStyle(firstSlide); const marginRight = parseFloat(style.marginRight);
 const marginLeft = parseFloat(style.marginLeft);

 let calculatedWidth = firstSlide.offsetWidth;
    if (calculatedWidth === 0) {
        calculatedWidth = firstSlide.getBoundingClientRect().width;
    }
    
    slideWidth = calculatedWidth + marginRight + marginLeft;
    
    if (slideWidth < 50) {
        slideWidth = 260; // Аварійне значення
        console.error('Карусель: Ширина слайда не визначилась, використовуємо аварійне значення 260px.');
    }
 // 2. Визначення кількості видимих слайдів
 const containerWidth = carouselWrapper.parentElement.offsetWidth;
visibleSlidesCount = Math.floor(containerWidth / slideWidth); 
 if (visibleSlidesCount === 0) visibleSlidesCount = 1;


 // 3. Клонування
    const existingClones = carouselWrapper.querySelectorAll('.carousel-slide:nth-child(n + ' + (originalSlides.length + 1) + ')');
    existingClones.forEach(clone => clone.remove());
    
 for (let i = 0; i < visibleSlidesCount; i++) {
 if (originalSlides[i]) {
 const clone = originalSlides[i].cloneNode(true);
 carouselWrapper.appendChild(clone);
 }
 }
 slides = document.querySelectorAll(".js-carousel-wrapper .carousel-slide"); 

 // 4. Запускаємо прокручування
 slideIndex = 0; 
 updateCarouselPosition(); 
 setTimeout(advanceSlide, CAROUSEL_SPEED); 
 console.log(`Карусель запущена. Швидкість: ${CAROUSEL_SPEED}мс, Ширина: ${slideWidth}px, Видимих: ${visibleSlidesCount}`);
}

/**
 * Ініціалізація каруселі.
 * Викликається з main.js.
 */
export function initCarousel() {
    // Встановлюємо затримку 200 мс, щоб дати CSS гарантовано завантажитися перед обчисленням ширини
    setTimeout(startInitialization, 200); 
}