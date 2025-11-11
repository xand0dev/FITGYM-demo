/* ===========================
   auth.js — "Охоронець" (Автентифікація)
   =========================== */

// Імпортуємо 'api.js' для 'postApiData'
import { postApiData } from './api.js';
// Імпортуємо 'ui.js' для 'showToast', 'closeModal', 'escapeHtml'
import { showToast, closeModal, escapeHtml } from './ui.js';
// Імпортуємо 'reviews.js' для оновлення списку відгуків після логіну
import { populateReviews } from './reviews.js';

// --- LocalStorage Helpers ---

function _get(key, def = null) {
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

// --- Token & User Management ---

export function saveToken(token, userName) {
    _set('fp_token', token);
    _set('fp_user_name', userName);
}

export function getToken() {
    return _get('fp_token', null);
}

export function getUserName() {
    return _get('fp_user_name', null);
}

export function logoutUser() {
    localStorage.removeItem('fp_token');
    localStorage.removeItem('fp_user_name');
    location.reload();
}


/**
 * Оновлює хедер (Привіт, Юзер / Вхід / РЕЄСТРАЦІЯ)
 * Тепер вона показує кнопку "Кабінет", якщо юзер залогінений.
 */
export function updateAuthArea() {
    const area = document.getElementById('authArea');
    const reviewBtn = document.getElementById('openReviewModalBtn');
    if (!area) return;

    const token = getToken();
    const userName = getUserName();

    if (token && userName) {
        // === ЮЗЕР ЗАЛОГІНЕНИЙ ===
        area.innerHTML = `
            <span style="margin-right:10px; color: var(--muted);">
                Привіт, <b>${escapeHtml(userName)}</b>
            </span>
            <a href="cabinet.html" class="btn btn-ghost">
                <i class="fas fa-user-circle"></i> Кабінет
            </a>
            <button id="logoutBtn" class="btn btn-primary">
                <i class="fas fa-sign-out-alt"></i> Вихід
            </button>`;

        // Навішуємо подію на кнопку "Вихід"
        document.getElementById('logoutBtn').addEventListener('click', logoutUser);

        // Показуємо кнопку "Залишити відгук"
        if (reviewBtn) reviewBtn.style.display = 'inline-block';

    } else {
        // === ЮЗЕР - ГІСТЬ ===
        area.innerHTML = `
            <button class="btn btn-ghost" onclick="showModal('loginModal')">ВХІД</button>
            <button class="btn btn-primary" onclick="showModal('registerModal')">РЕЄСТРАЦІЯ</button>`;

        // Ховаємо кнопку "Залишити відгук"
        if (reviewBtn) reviewBtn.style.display = 'none';
    }
}

// --- Event Listeners (Ініціалізація) ---

export function initAuth() {
    // Обробник форми Реєстрації
    const regForm = document.getElementById('registerForm');
    if (regForm) {
        regForm.addEventListener('submit', handleRegister);
    }

    // Обробник форми Логіну
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Прив'язуємо 'showModal' до window, щоб onclick="showModal(...)" працював
    // (Це потрібно, бо 'updateAuthArea' створює ці кнопки динамічно)
    window.showModal = (id) => {
        const modal = document.getElementById(id);
        if (modal) modal.style.display = 'flex';
    };
}

// --- Form Handlers ---

/**
 * Обробляє відправку форми реєстрації
 */
async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pass = document.getElementById('regPassword').value;
    const conf = document.getElementById('regConfirm').value;

    if (!name || !username || !email || !pass) return showToast('Заповніть всі поля', 'error');
    if (pass !== conf) return showToast('Паролі не співпадають', 'error');
    if (pass.length < 8) return showToast('Пароль має бути не менше 8 символів', 'error');

    try {
        const data = await postApiData('/api/register/', {
            name: name,
            username: username,
            email: email,
            password: pass
        });

        // УСПІХ!
        showToast('Реєстрація успішна! Ви автоматично увійшли.', 'success');
        saveToken(data.token, data.name); // Зберігаємо токен і ім'я

        closeModal('registerModal');
        updateAuthArea(); // Оновлюємо хедер
        populateReviews(); // Оновлюємо відгуки
        document.getElementById('registerForm').reset();

    } catch (err) {
        console.error('Register Error:', err);
        showToast(err.message, 'error');
    }
}

/**
 * Обробляє відправку форми логіну
 */
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const pass = document.getElementById('loginPassword').value;
    if (!username || !pass) return showToast('Заповніть всі поля', 'error');

    try {
        // ЕТАП 1: Отримуємо токен
        const data = await postApiData('/api/login/', {
            username: username,
            password: pass
        });

        const token = data.token;
        if (!token) throw new Error('Токен не отримано');

        // УСПІХ!
        showToast('Вхід успішний', 'success');

        // TODO: Замінити 'username' на fetch() до /api/me/ (Етап 3)
        saveToken(token, username); // Тимчасово зберігаємо 'username'

        closeModal('loginModal');
        updateAuthArea(); // Оновлюємо хедер
        populateReviews(); // Оновлюємо відгуки
        document.getElementById('loginForm').reset();

    } catch (err) {
        console.error('Login Error:', err);
        showToast(err.message, 'error');
    }
}