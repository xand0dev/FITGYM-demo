/* ===========================
   main.js — ЛОГІКА САЙТУ FITGYM (ФІНАЛЬНА ВЕРСІЯ З API-ІНТЕГРАЦІЄЮ ТА СИНХРОННИМ КАЛЕНДАРЕМ)
   =========================== */

const BASE_URL = 'http://127.0.0.1:8000'; // Основна адреса сервера API

/* 🌟 Security Helper 🌟 */
function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;')
             .replace(/"/g, '&quot;')
             .replace(/'/g, '&#039;');
}

/* === Toast === */
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'toast ' + (type === 'error' ? 'error' : 'success');
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}

/* === Modal Functions === */
function showModal(id) {
    document.getElementById(id).style.display = 'flex';
}
function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}
function closeModalOnOutsideClick(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.style.display = 'none';
    }
}

/* === LocalStorage helpers === */
function _get(key, def = []) {
    try { return JSON.parse(localStorage.getItem(key)) || def; }
    catch { return def; }
}
function _set(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

/* === Auth === */
function _getUsers() { return _get('fp_users', []); }
function _setUsers(u){ _set('fp_users', u); }

function registerUser(name, email, password, role = "user") {
    const users = _getUsers();
    if (users.some(u => u.email === email.toLowerCase()))
        return { ok: false, msg: 'Email вже існує' };
    if (password.length < 6)
        return { ok: false, msg: 'Пароль має бути не менше 6 символів' };
    
    users.push({ name, email: email.toLowerCase(), password, role });
    _setUsers(users);
    return { ok: true };
}

function loginUser(email, password) {
    const users = _getUsers();
    const user = users.find(u => u.email === email.toLowerCase() && u.password === password);
    if (!user) return { ok: false, msg: 'Невірний email або пароль' };
    _set('fp_current', user);
    return { ok: true, user };
}

function logoutUser() {
    localStorage.removeItem('fp_current');
    location.reload(); 
}

function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem('fp_current')) || null; }
    catch { return null; }
}

/* === Auth Area Update (ВКЛЮЧАЄ КНОПКУ ВІДГУКУ) === */
function updateAuthArea() {
    const area = document.getElementById('authArea');
    const reviewBtn = document.getElementById('openReviewModalBtn');
    if (!area) return;
    const cur = getCurrentUser();

    if (cur) {
        area.innerHTML = `
            <span style="margin-right:10px">Привіт, <b>${escapeHtml(cur.name)}</b></span>
            <button id="logoutBtn" class="btn btn-ghost" onclick="logoutUser()">Вихід</button>`;
        if (reviewBtn) reviewBtn.style.display = 'inline-block';
    } else {
        area.innerHTML = `
            <button class="btn btn-ghost" onclick="showModal('loginModal')">Вхід</button>
            <button class="btn btn-primary" onclick="showModal('registerModal')">Реєстрація</button>`;
        if (reviewBtn) reviewBtn.style.display = 'none';
    }
}

/* 1. API: ТРЕНЕРИ (ОНОВЛЕНО ДЛЯ full_name та specialties) */
async function populateTrainers() {
    const grid = document.getElementById('trainersGrid');
    if (!grid) return;

    let trainers = [];
    try {
        const response = await fetch(`${BASE_URL}/api/instructors/`);
        if (!response.ok) throw new Error('Помилка завантаження тренерів');
        
        trainers = await response.json();
        if (!Array.isArray(trainers)) throw new Error('Невірний формат даних API');
        
    } catch (error) {
        console.error("API Error (Trainers):", error);
        showToast('Помилка підключення до API: Тренери. Використовуються демонстраційні дані.', 'error');
        // Заглушка (mock data)
        trainers = [
            { full_name: 'Іван Петров', specialties: 'Кросфіт / Функціональний тренінг', photo_url: '../img/муж2.jpg' }, 
            { full_name: 'Олена Коваль', specialties: 'Фітнес / Йога / Стретчинг', photo_url: '../img/жін2.jpg' }, 
            { full_name: 'Андрій Сидоренко', specialties: 'Бодібілдинг / Персональні тренування', photo_url: '../img/муж1.png' },
        ];
    }

    grid.innerHTML = trainers.map((p, i) => `
        <div class="trainer-card" data-aos="flip-up" data-aos-delay="${i * 150}">
            <img src="${escapeHtml(p.photo_url || '../img/default-avatar.png')}" alt="${escapeHtml(p.full_name)}">
            <div class="meta">
                <h3>${escapeHtml(p.full_name)}</h3>
                <p>${escapeHtml(p.specialties)}</p>
            </div>
        </div>`).join('');
}

/* 3. API: АБОНЕМЕНТИ */
async function populatePlans() {
    const grid = document.getElementById('plansGrid');
    if (!grid) return;

    let plans = [];
    try {
        const response = await fetch(`${BASE_URL}/api/membership-types/`);
        if (!response.ok) throw new Error('Помилка завантаження абонементів');

        plans = await response.json();
        if (!Array.isArray(plans)) throw new Error('Невірний формат даних API');

    } catch (error) {
        console.error("API Error (Plans):", error);
        showToast('Помилка підключення до API: Абонементи. Використовуються демонстраційні дані.', 'error');
        // Заглушка (mock data)
        plans = [
            { type_name: 'BASIC', price: '800', duration_unit: 'місяць', features: ['Доступ до обладнання', 'Безлімітний час'] },
            { type_name: 'PLUS', price: '1200', duration_unit: 'місяць', features: ['Усі переваги BASIC', '2 перс. тренування', 'Консультації'] },
            { type_name: 'VIP', price: '2500', duration_unit: 'місяць', features: ['Усі переваги PLUS', 'Безлімітні перс. тренування', 'VIP доступ'] }
        ];
    }
    
    grid.innerHTML = plans.map((p, i) => {
        const isFeatured = p.type_name.toUpperCase() === 'PLUS' || i === 1 ? 'pricing-card--featured' : '';
        const btnClass = isFeatured ? 'btn-primary' : 'btn-ghost';
        
        return `
            <div class="pricing-card ${isFeatured}" data-aos="zoom-in" data-aos-delay="${i * 150}">
                <h3 class="plan-name">${escapeHtml(p.type_name)}</h3>
                <p class="plan-price">₴${escapeHtml(p.price)}<span>/${escapeHtml(p.duration_unit)}</span></p>
                <ul class="plan-features">
                    ${p.features && Array.isArray(p.features) ? p.features.map(f => `<li><i class="fas fa-check-circle"></i> ${escapeHtml(f)}</li>`).join('') : '<li>Деталі відсутні</li>'}
                </ul>
                <button class="btn ${btnClass}" onclick="handleBuyPlan('${escapeHtml(p.type_name)}')">Придбати онлайн</button>
            </div>`;
    }).join('');
}

function handleBuyPlan(plan){
    const user = getCurrentUser();
    if (!user) return showToast('Спершу увійдіть у систему, щоб придбати', 'error');
    showToast(`Оформлення замовлення: ${escapeHtml(plan)}`, 'success');
}

/* --- LOGIC FOR MULTIPLE RATING INPUTS (АНКЕТА) --- */
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
                if (starRating <= rating) {
                    star.classList.replace('far', 'fas');
                } else {
                    star.classList.replace('fas', 'far');
                }
            });
        };

        stars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.getAttribute('data-rating'));
                input.value = rating;
                fillStars(rating);
            });
            
            star.addEventListener('mouseover', () => {
                const rating = parseInt(star.getAttribute('data-rating'));
                fillStars(rating);
            });
            star.addEventListener('mouseout', () => {
                fillStars(parseInt(input.value)); 
            });
        });
        
        fillStars(initialRating);
    });
}

/* === Reviews (ВКЛЮЧАЄ ФІЛЬТРАЦІЮ/TOGGLE) === */
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


function populateReviews() {
    const el = document.getElementById('reviewsList');
    const toggleBtnContainer = document.getElementById('toggleReviewsContainer');
    if (!el || !toggleBtnContainer) return;

    const base = [
        { text: 'Найкращий спортзал у місті! Тренери дуже уважні та професійні. Окрема подяка Івану за мотивацію!', author: 'Олена, Київ', rating: 5, avatar: '../img/jinka.png', system: true },
        { text: 'Обладнання сучасне, атмосфера чудова, але ввечері забагато людей. Результатом задоволений.', author: 'Андрій, Львів', rating: 4, avatar: '../img/муж1.png', system: true },
        { text: 'Чудовий розклад та дуже привітний персонал! Рекомендую всім початківцям.', author: 'Марина К.', rating: 5, avatar: '../img/default-avatar.png', system: true },
        { text: 'Трохи замало місця у роздягальнях, але тренажери топ. Варто своїх грошей.', author: 'Сергій П.', rating: 4, avatar: '../img/default-avatar.png', system: true },
        { text: 'Ходжу півроку, все супер. Чисто, охайно, професійно. Дякую команді FITGYM!', author: 'Вікторія О.', rating: 5, avatar: '../img/default-avatar.png', system: true },
    ];
    const stored = _get('fp_reviews', []);
    const all = [...base, ...stored];
    const user = getCurrentUser();

    const generateStars = (rating) => {
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            starsHtml += `<i class="${i <= rating ? 'fas' : 'far'} fa-star"></i>`;
        }
        return `<div class="review-rating">${starsHtml}</div>`;
    };

    el.innerHTML = all.map((r, i) => {
        const isOwn = user && r.author === user.name && !r.system;
        const avatarSrc = r.avatar || '../img/default-avatar.png';
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

    // Налаштування кнопки "Показати більше"
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

function setupReviewForm() {
    const form = document.getElementById('reviewForm');
    const modal = document.getElementById('reviewFormModal');
    if (!form || !modal) return;
    
    setupMultipleRatingInputs(); 

    const openBtn = document.getElementById('openReviewModalBtn');
    if (openBtn) {
        openBtn.addEventListener('click', () => {
            showModal('reviewFormModal');
        });
        openBtn.style.display = 'none'; 
    }

    form.addEventListener('submit', e => {
        e.preventDefault();
        
        const trainer = document.getElementById('staffName').value.trim();
        const text = document.getElementById('reviewText').value.trim();
        
        const prof_rating = parseInt(form.querySelector('input[name="trainer_prof"]').value) || 5;
        const clean_rating = parseInt(form.querySelector('input[name="gym_cleanliness"]').value) || 5;
        const reception_rating = parseInt(form.querySelector('input[name="reception_speed"]').value) || 5;
        
        const avg_rating = Math.round((prof_rating + clean_rating + reception_rating) / 3);

        if (!text) return showToast('Введіть ваш детальний відгук', 'error');

        const user = getCurrentUser();
        const reviews = _get('fp_reviews', []);
        
        const reviewDetails = `
            ${text} 
            (Тренер: ${trainer || 'N/A'}, 
            Проф. тренера: ${prof_rating}/5, 
            Чистота: ${clean_rating}/5, 
            Рецепція: ${reception_rating}/5)
        `.trim();

        reviews.push({ 
            text: reviewDetails, 
            author: user.name, 
            rating: avg_rating,
            avatar: '../img/default-avatar.png' 
        }); 
        _set('fp_reviews', reviews);
        
        showToast('Анкету успішно надіслано! Дякуємо за ваш відгук.', 'success');
        closeModal('reviewFormModal');
        form.reset();
        populateReviews();
    });
}

/* 2. API: РОЗКЛАД (СИНХРОННА ВЕРСІЯ ДЛЯ ГАРАНТОВАНОГО РЕНДЕРИНГУ) */
function initCalendar() {
    const calendarEl = document.getElementById("calendar");
    if (!calendarEl) return;
    
    // Використовуємо тільки демонстраційні дані для гарантованого рендерингу
    // Це забезпечує, що календар з'явиться, навіть якщо API заблоковано.
    const demoEvents = [
        { title: "Йога — Олена", start: "2025-11-06T08:00:00", end: "2025-11-06T09:00:00" },
        { title: "Кросфіт — Іван", start: "2025-11-06T18:00:00", end: "2025-11-06T19:00:00" },
        { title: "Бодібілдинг — Андрій", start: "2025-11-07T09:00:00", end: "2025-11-07T10:00:00" },
        { title: "Функціональний тренінг", start: "2025-11-10T19:00:00", end: "2025-11-10T20:00:00" },
    ];

    const calendar = new FullCalendar.Calendar(calendarEl, {
        locale: "uk",
        initialView: "dayGridMonth",
        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay"
        },
        buttonText: {
            today: "Сьогодні",
            month: "Місяць",
            week: "Тиждень",
            day: "День"
        },
        events: demoEvents,
        eventClick(info) {
            showToast(`Заняття: ${escapeHtml(info.event.title)}`, 'success');
        }
    });
    
    calendar.render(); 
    calendar.updateSize(); 
}


/* === Smooth Scrolling === */
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }

            const nav = document.querySelector('.nav-primary');
            if (window.innerWidth <= 768 && nav) { 
                nav.style.display = 'none';
            }
        });
    });
}

/* === INIT (Ініціалізація) === */
document.addEventListener('DOMContentLoaded', () => {
    // Ініціалізація AOS (з перевіркою)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true 
        });
    }
    
    updateAuthArea(); 
    populateTrainers(); 
    populatePlans();   
    populateReviews();
    setupReviewForm();
    
    // 💥 ВИКЛИК СИНХРОННОГО КАЛЕНДАРЯ
    if (typeof FullCalendar !== 'undefined') initCalendar(); 
    
    setupSmoothScrolling();

    // hamburger toggle
    const hamb = document.querySelector('.hamburger');
    if (hamb) hamb.addEventListener('click', () => {
        const nav = document.querySelector('.nav-primary');
        const isVisible = nav.style.display === 'flex';
        nav.style.display = isVisible ? 'none' : 'flex'; 
    });

    // Register Form Handler
    const regForm = document.getElementById('registerForm');
    if (regForm) regForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const pass = document.getElementById('regPassword').value;
        const conf = document.getElementById('regConfirm').value;
        const isTrainer = document.getElementById('isTrainer')?.checked;

        if (!name || !email || !pass) return showToast('Заповніть всі поля', 'error');
        if (pass !== conf) return showToast('Паролі не співпадають', 'error');

        const role = isTrainer ? 'trainer' : 'user';
        const res = registerUser(name, email, pass, role);
        if (!res.ok) return showToast(res.msg, 'error');

        showToast('Реєстрація успішна!', 'success');
        closeModal('registerModal');
        document.getElementById('regForm').reset();
    });

    // Login Form Handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const pass = document.getElementById('loginPassword').value;
        if (!email || !pass) return showToast('Заповніть всі поля', 'error');

        const res = loginUser(email, pass);
        if (!res.ok) return showToast(res.msg, 'error');

        showToast('Вхід успішний', 'success');
        closeModal('loginModal');
        updateAuthArea(); 
        populateReviews(); 
        document.getElementById('loginForm').reset();
    });
});