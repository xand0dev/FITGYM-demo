/* ===========================
   reviews.js — Логіка Відгуків та Анкет
   =========================== */

import { showToast, showModal, closeModal, escapeHtml } from './ui.js';
import { getToken, getUserName } from './auth.js';

// --- LocalStorage Helpers (Тільки для відгуків) ---
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
// ---

/* --- Логіка для зірочок в анкеті --- */
function setupMultipleRatingInputs() {
    document.querySelectorAll('.star-rating-controls').forEach(container => {
        const name = container.getAttribute('data-name');
        const initialRating = parseInt(container.getAttribute('data-rating')) || 5;
        const input = document.querySelector(`input[name="${name}"]`);

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
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.getAttribute('data-rating'));
                input.value = rating;
                fillStars(rating);
            });
            star.addEventListener('mouseover', () => fillStars(parseInt(star.getAttribute('data-rating'))));
            star.addEventListener('mouseout', () => fillStars(parseInt(input.value)));
        });
        fillStars(initialRating);
    });
}

/* --- Логіка "Показати ще" --- */
const SHOW_COUNT = 3;
function toggleReviews() {
    const hiddenReviews = document.querySelectorAll('#reviewsList .review-hidden');
    const button = document.getElementById('toggleReviewsBtn');
    if (!button) return;

    if (button.dataset.expanded === 'true') {
        hiddenReviews.forEach(el => el.style.display = 'none');
        const totalCount = document.querySelectorAll('#reviewsList .review-item').length;
        button.innerHTML = `Показати всі ${totalCount} відгуків`;
        button.dataset.expanded = 'false';
        document.getElementById('reviews').scrollIntoView({ behavior: 'smooth' });
    } else {
        hiddenReviews.forEach(el => el.style.display = 'block');
        button.innerHTML = 'Приховати додаткові відгуки';
        button.dataset.expanded = 'true';
    }
}

/* --- Заповнення відгуків (Фейкові дані) --- */
export function populateReviews() {
    const el = document.getElementById('reviewsList');
    const toggleBtnContainer = document.getElementById('toggleReviewsContainer');
    if (!el || !toggleBtnContainer) return;

    // TODO: Замінити 'base' та 'stored' на fetch() до API /api/reviews/
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

    el.innerHTML = all.map((r, i) => {
        const isOwn = user.name && r.author === user.name && !r.system;
        const avatarSrc = r.avatar || 'img/муж1.png';
        const isHidden = i >= SHOW_COUNT ? 'review-hidden' : '';
        return `
            <div class="review-item ${isHidden}" data-aos="fade-up" data-aos-delay="${i * 100}">
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

    if (all.length > SHOW_COUNT) {
        toggleBtnContainer.innerHTML = `<button id="toggleReviewsBtn" class="btn btn-ghost">Показати всі ${all.length} відгуків</button>`;
        document.getElementById('toggleReviewsBtn').addEventListener('click', toggleReviews);
    } else {
        toggleBtnContainer.innerHTML = '';
    }

    document.querySelectorAll('.delete-review').forEach(btn => {
        btn.addEventListener('click', e => {
            const idx = +e.target.dataset.index - base.length;
            if (idx < 0) return;
            const reviews = _get('fp_reviews', []);
            reviews.splice(idx, 1);
            _set('fp_reviews', reviews);
            showToast('Відгук видалено', 'success');
            populateReviews();
        });
    });
    if (typeof AOS !== 'undefined') AOS.refreshHard();
}

/* --- Налаштування форми відгуків (Анкета) --- */
export function setupReviewForm() {
    const form = document.getElementById('reviewForm');
    const modal = document.getElementById('reviewFormModal');
    if (!form || !modal) return;

    setupMultipleRatingInputs();

    const openBtn = document.getElementById('openReviewModalBtn');
    if (openBtn) {
        openBtn.addEventListener('click', () => {
            const token = getToken();
            if (!token) {
                showToast('Будь ласка, увійдіть, щоб залишити відгук', 'error');
                showModal('loginModal');
                return;
            }
            showModal('reviewFormModal');
        });
        openBtn.style.display = 'none';
    }

    form.addEventListener('submit', e => {
        e.preventDefault();
        const text = document.getElementById('reviewText').value.trim();
        if (!text) return showToast('Введіть ваш детальний відгук', 'error');

        const user = { name: getUserName() };
        if (!user.name) return showToast('Помилка сесії, увійдіть знову', 'error');

        const trainer = document.getElementById('staffName').value.trim();
        const prof_rating = parseInt(form.querySelector('input[name="trainer_prof"]').value) || 5;
        const clean_rating = parseInt(form.querySelector('input[name="gym_cleanliness"]').value) || 5;
        const reception_rating = parseInt(form.querySelector('input[name="reception_speed"]').value) || 5;
        const avg_rating = Math.round((prof_rating + clean_rating + reception_rating) / 3);
        const reviewDetails = `${text} (Тренер: ${trainer || 'N/A'}, Оцінки: Проф:${prof_rating}, Чистота:${clean_rating}, Рецепція:${reception_rating})`;

        const reviews = _get('fp_reviews', []);
        reviews.push({
            text: reviewDetails,
            author: user.name,
            rating: avg_rating,
            avatar: 'img/муж1.png'
        });
        _set('fp_reviews', reviews);

        showToast('Анкету успішно надіслано! Дякуємо.', 'success');
        closeModal('reviewFormModal');
        form.reset();
        populateReviews();
    });
}