/* ===========================
   reviews.js — Reviews & Rating Logic
   ---------------------------
   Відповідає за: Відображення списку відгуків,
   Роботу форми "Залишити відгук", Рейтинг зірочками.
   =========================== */

import { showToast, openModal, closeModal, escapeHtml } from './ui.js';
import { getToken, getUserName } from './auth.js';

// --- LocalStorage Helpers (Private) ---
function _get(key, def = []) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : def;
    } catch {
        return def;
    }
}
function _set(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
}

/* --- Star Rating Logic (UI) --- */
function setupMultipleRatingInputs() {
    document.querySelectorAll('.star-rating-controls').forEach(container => {
        const name = container.getAttribute('data-name');
        const initialRating = parseInt(container.getAttribute('data-rating')) || 5;
        const input = document.querySelector(`input[name="${name}"]`);

        // Генеруємо зірочки
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            const starClass = i <= initialRating ? 'fas' : 'far';
            starsHtml += `<i class="${starClass} fa-star" data-rating="${i}" data-target="${name}"></i>`;
        }
        container.innerHTML = starsHtml;

        const stars = container.querySelectorAll('.fa-star');

        const fillStars = (rating) => {
            stars.forEach(star => {
                const starRating = parseInt(star.getAttribute('data-rating'));
                if (starRating <= rating) star.classList.replace('far', 'fas');
                else star.classList.replace('fas', 'far');
            });
        };

        // Інтерактивність
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.getAttribute('data-rating'));
                if (input) input.value = rating;
                fillStars(rating);
            });
            star.addEventListener('mouseover', () => fillStars(parseInt(star.getAttribute('data-rating'))));
            star.addEventListener('mouseout', () => fillStars(parseInt(input ? input.value : 5)));
        });

        fillStars(initialRating);
    });
}

/* --- "Show More" Logic --- */
const SHOW_COUNT = 3;

function toggleReviews() {
    const hiddenReviews = document.querySelectorAll('#reviewsList .review-hidden');
    const button = document.getElementById('toggleReviewsBtn');
    if (!button) return;

    if (button.dataset.expanded === 'true') {
        // Ховаємо
        hiddenReviews.forEach(el => el.style.display = 'none');
        const totalCount = document.querySelectorAll('#reviewsList .review-item').length;
        button.innerHTML = `Показати всі ${totalCount} відгуків`;
        button.dataset.expanded = 'false';

        const reviewsSection = document.getElementById('reviews');
        if(reviewsSection) reviewsSection.scrollIntoView({ behavior: 'smooth' });
    } else {
        // Показуємо
        hiddenReviews.forEach(el => el.style.display = 'block');
        button.innerHTML = 'Приховати додаткові відгуки';
        button.dataset.expanded = 'true';
    }
}

/* --- Populate Reviews (Main Function) --- */
export function populateReviews() {
    const el = document.getElementById('reviewsList');
    const toggleBtnContainer = document.getElementById('toggleReviewsContainer');
    if (!el || !toggleBtnContainer) return;

    // TODO: Замінити на fetch API
    const base = [
        { text: 'Найкращий спортзал у місті!', author: 'Олена, Київ', rating: 5, avatar: 'img/жін1.png', system: true },
        { text: 'Обладнання сучасне, атмосфера чудова.', author: 'Андрій, Львів', rating: 4, avatar: 'img/муж1.png', system: true },
        { text: 'Чудовий розклад та привітний персонал!', author: 'Марина К.', rating: 5, avatar: 'img/жін2.jpg', system: true },
        { text: 'Трохи замало місця у роздягальнях.', author: 'Сергій П.', rating: 4, avatar: 'img/муж2.jpg', system: true },
        { text: 'Ходжу півроку, все супер.', author: 'Вікторія О.', rating: 5, avatar: 'img/жін1.png', system: true },
    ];

    const stored = _get('fp_reviews', []);
    const all = [...base, ...stored];
    const user = { name: getUserName() };

    const generateStars = (rating) => {
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            starsHtml += `<i class="${i <= rating ? 'fas' : 'far'} fa-star"></i>`;
        }
        return `<div class="review-rating">${starsHtml}</div>`;
    };

    // Рендеринг
    el.innerHTML = all.map((r, i) => {
        const isOwn = user.name && r.author === user.name && !r.system;
        const avatarSrc = r.avatar || 'img/муж1.png';
        // Перші 3 показуємо, інші ховаємо класом
        const isHidden = i >= SHOW_COUNT ? 'review-hidden' : '';
        const style = i >= SHOW_COUNT ? 'display: none;' : '';

        return `
            <div class="review-item ${isHidden}" style="${style}" data-aos="fade-up" data-aos-delay="${(i % 3) * 100}">
                <div class="review-header">
                    <img src="${escapeHtml(avatarSrc)}" alt="${escapeHtml(r.author)}" class="review-avatar">
                    <div class="reviewer-meta">
                        <h4>${escapeHtml(r.author)}</h4>
                        ${generateStars(r.rating || 5)}
                    </div>
                </div>
                <div class="review-body">${escapeHtml(r.text)}</div>
                ${isOwn ? `<button class="delete-review" data-index="${i}">🗑️</button>` : ''}
            </div>`;
    }).join('');

    // Кнопка "Показати ще"
    if (all.length > SHOW_COUNT) {
        toggleBtnContainer.innerHTML = `<button id="toggleReviewsBtn" class="btn btn-ghost" data-expanded="false">Показати всі ${all.length} відгуків</button>`;
        document.getElementById('toggleReviewsBtn').addEventListener('click', toggleReviews);
    } else {
        toggleBtnContainer.innerHTML = '';
    }

    // Логіка видалення своїх відгуків
    document.querySelectorAll('.delete-review').forEach(btn => {
        btn.addEventListener('click', e => {
            const idx = +e.target.dataset.index - base.length;
            if (idx < 0) return; // Не можна видаляти системні відгуки

            const reviews = _get('fp_reviews', []);
            reviews.splice(idx, 1);
            _set('fp_reviews', reviews);

            showToast('Ваш відгук видалено', 'success');
            populateReviews();
        });
    });

    // Оновлюємо анімації, якщо AOS підключено
    if (typeof AOS !== 'undefined') AOS.refresh();
}

/* --- Review Form Logic --- */
export function setupReviewForm() {
    const form = document.getElementById('reviewForm');
    const modal = document.getElementById('reviewFormModal');

    if (!form || !modal) return;

    setupMultipleRatingInputs();

    // Кнопка відкриття модалки відгуку
    const openBtn = document.getElementById('openReviewModalBtn');
    if (openBtn) {
        // Клонуємо кнопку, щоб уникнути дублювання подій при перезавантаженні модуля
        const newBtn = openBtn.cloneNode(true);
        openBtn.parentNode.replaceChild(newBtn, openBtn);

        newBtn.addEventListener('click', () => {
            const token = getToken();
            if (!token) {
                showToast('Будь ласка, увійдіть, щоб залишити відгук', 'error');
                openModal('loginModal'); // <--- ТУТ БУЛА ПОМИЛКА (showModal -> openModal)
                return;
            }
            openModal('reviewFormModal'); // <--- ТУТ БУЛА ПОМИЛКА (showModal -> openModal)
        });

        // Початковий стан кнопки (прихована/показана) контролюється в auth.js,
        // але тут можна задати дефолт
        newBtn.style.display = 'none';
    }

    // Обробка відправки форми
    // Видаляємо старі лісенери через клонування форми
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    newForm.addEventListener('submit', e => {
        e.preventDefault();
        const text = document.getElementById('reviewText').value.trim();
        if (!text) return showToast('Напишіть текст відгуку', 'error');

        const user = { name: getUserName() };
        if (!user.name) return showToast('Помилка авторизації', 'error');

        const trainer = document.getElementById('staffName').value.trim();

        // Збираємо рейтинги
        const prof_rating = parseInt(newForm.querySelector('input[name="trainer_prof"]').value) || 5;
        const clean_rating = parseInt(newForm.querySelector('input[name="gym_cleanliness"]').value) || 5;
        const reception_rating = parseInt(newForm.querySelector('input[name="reception_speed"]').value) || 5;

        const avg_rating = Math.round((prof_rating + clean_rating + reception_rating) / 3);
        const reviewDetails = `${text} (Тренер: ${trainer || '-'}, Рейтинг: ${avg_rating}/5)`;

        // Зберігаємо (поки що в LocalStorage)
        const reviews = _get('fp_reviews', []);
        reviews.push({
            text: reviewDetails,
            author: user.name,
            rating: avg_rating,
            avatar: 'img/муж1.png' // заглушка аватара
        });
        _set('fp_reviews', reviews);

        showToast('Дякуємо за ваш відгук!', 'success');
        closeModal('reviewFormModal');
        newForm.reset();
        populateReviews();
    });
}