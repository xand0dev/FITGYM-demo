/* ===========================
   auth.js — "Охоронець" (Автентифікація)
   =========================== */

import { postApiData, getApiData } from './api.js';
import { showToast, closeModal, openModal, escapeHtml } from './ui.js';
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

// --- Token Management ---
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

export function getUserIsStaff() {
    return _get('fp_is_staff', false);
}

export function logoutUser() {
    localStorage.removeItem('fp_token');
    localStorage.removeItem('fp_user_name');
    localStorage.removeItem('fp_is_staff');
    location.reload();
}

/**
 * ЗАВАНТАЖЕННЯ ПРОФІЛЮ (/api/me/)
 * Виправлено: Обробка масиву, якщо API повертає [ { ... } ]
 */
export async function fetchUserProfile() {
    const token = getToken();
    if (!token) return;

    try {
        const responseData = await getApiData('/api/me/');

        // 🛠 ВИПРАВЛЕННЯ ТУТ:
        // Перевіряємо, чи це масив. Якщо так — беремо перший елемент.
        const data = Array.isArray(responseData) ? responseData[0] : responseData;

        // Зберігаємо is_staff, якщо він прийшов
        if (data && typeof data.is_staff !== 'undefined') {
            _set('fp_is_staff', data.is_staff);
            console.log('Admin Status Updated:', data.is_staff); // Для налагодження
        }

        // Оновлюємо кнопки в хедері
        updateAuthArea();

    } catch (err) {
        console.error('Fetch Profile Error:', err);
    }
}

/**
 * Оновлює зону авторизації
 */
export function updateAuthArea() {
    const area = document.getElementById('authArea');
    const reviewBtn = document.getElementById('openReviewModalBtn');
    const adminLink = document.getElementById('adminLink');

    if (!area) return;

    const token = getToken();
    const userName = getUserName();
    const isStaff = getUserIsStaff();

    // 1. Показуємо/ховаємо кнопку Адмін-панелі
    if (adminLink) {
        if (token && isStaff === true) { // Явна перевірка на true
            adminLink.style.display = 'inline-flex'; // inline-flex виглядає краще з іконкою
            adminLink.style.alignItems = 'center';
            adminLink.style.gap = '8px';
        } else {
            adminLink.style.display = 'none';
        }
    }

    // 2. Оновлюємо зону користувача
    if (token && userName) {
        // === LOGGED IN ===
        area.innerHTML = `
            <span style="margin-right:10px; color: var(--text);">
                Привіт, <b>${escapeHtml(userName)}</b>
            </span>
            <a href="cabinet.html" class="btn btn-ghost" style="margin-right: 5px;">
                <i class="fas fa-user-circle"></i>
            </a>
            <button id="logoutBtn" class="btn btn-primary">
                <i class="fas fa-sign-out-alt"></i>
            </button>`;

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) logoutBtn.addEventListener('click', logoutUser);

        if (reviewBtn) reviewBtn.style.display = 'inline-block';

    } else {
        // === GUEST ===
        area.innerHTML = `
            <button id="authLoginBtn" class="btn btn-ghost">ВХІД</button>
            <button id="authRegisterBtn" class="btn btn-primary">РЕЄСТРАЦІЯ</button>`;

        const loginBtn = document.getElementById('authLoginBtn');
        const regBtn = document.getElementById('authRegisterBtn');

        if (loginBtn) loginBtn.addEventListener('click', () => openModal('loginModal'));
        if (regBtn) regBtn.addEventListener('click', () => openModal('registerModal'));

        if (reviewBtn) reviewBtn.style.display = 'none';
    }
}

// --- Init Listeners ---
export function initAuth() {
    const regForm = document.getElementById('registerForm');
    if (regForm) {
        const newRegForm = regForm.cloneNode(true);
        regForm.parentNode.replaceChild(newRegForm, regForm);
        newRegForm.addEventListener('submit', handleRegister);
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const newLoginForm = loginForm.cloneNode(true);
        loginForm.parentNode.replaceChild(newLoginForm, loginForm);
        newLoginForm.addEventListener('submit', handleLogin);
    }

    if (getToken()) {
        fetchUserProfile();
    }
}

// --- Handlers ---
async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pass = document.getElementById('regPassword').value;
    const conf = document.getElementById('regConfirm').value;

    if (!name || !username || !email || !pass) return showToast('Всі поля обов\'язкові', 'error');
    if (pass !== conf) return showToast('Паролі не співпадають', 'error');
    if (pass.length < 8) return showToast('Пароль від 8 символів', 'error');

    try {
        const data = await postApiData('/api/register/', {
            name, username, email, password: pass
        });

        showToast('Акаунт створено!', 'success');
        saveToken(data.token, data.name);

        await fetchUserProfile();

        closeModal('registerModal');
        updateAuthArea();
        populateReviews();
        e.target.reset();

    } catch (err) {
        console.error('Register Error:', err);
        showToast(err.message || 'Помилка реєстрації', 'error');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const pass = document.getElementById('loginPassword').value;

    if (!username || !pass) return showToast('Введіть дані', 'error');

    try {
        const data = await postApiData('/api/login/', {
            username, password: pass
        });

        if (!data.token) throw new Error('Сервер не надіслав токен');

        showToast('Вхід успішний', 'success');
        saveToken(data.token, username);

        await fetchUserProfile();

        closeModal('loginModal');
        updateAuthArea();
        populateReviews();
        e.target.reset();

    } catch (err) {
        console.error('Login Error:', err);
        showToast(err.message || 'Невірний логін/пароль', 'error');
    }
}