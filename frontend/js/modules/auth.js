/* ===========================
   auth.js — "Охоронець" (Автентифікація)
   =========================== */

import { postApiData } from './api.js';
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

export function logoutUser() {
    localStorage.removeItem('fp_token');
    localStorage.removeItem('fp_user_name');
    location.reload();
}

/**
 * Оновлює зону авторизації і ВРУЧНУ вішає події (Event Listeners).
 * Це надійніше, ніж onclick="" в HTML.
 */
export function updateAuthArea() {
    const area = document.getElementById('authArea');
    const reviewBtn = document.getElementById('openReviewModalBtn');

    if (!area) return;

    const token = getToken();
    const userName = getUserName();

    if (token && userName) {
        // === LOGGED IN ===
        area.innerHTML = `
            <span style="margin-right:10px; color: var(--text-color);">
                Привіт, <b>${escapeHtml(userName)}</b>
            </span>
            <a href="cabinet.html" class="btn btn-ghost" style="margin-right: 5px;">
                <i class="fas fa-user-circle"></i>
            </a>
            <button id="logoutBtn" class="btn btn-primary">
                <i class="fas fa-sign-out-alt"></i>
            </button>`;

        // Слухач на Вихід
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) logoutBtn.addEventListener('click', logoutUser);

        if (reviewBtn) reviewBtn.style.display = 'inline-block';

    } else {
        // === GUEST (ГІСТЬ) ===
        // Зверни увагу: ми прибрали onclick і додали ID
        area.innerHTML = `
            <button id="authLoginBtn" class="btn btn-ghost">ВХІД</button>
            <button id="authRegisterBtn" class="btn btn-primary">РЕЄСТРАЦІЯ</button>`;

        // ВРУЧНУ вішаємо події (Це 100% працює)
        const loginBtn = document.getElementById('authLoginBtn');
        const regBtn = document.getElementById('authRegisterBtn');

        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                console.log('Login Clicked'); // Для перевірки в консолі
                openModal('loginModal');
            });
        }

        if (regBtn) {
            regBtn.addEventListener('click', () => {
                openModal('registerModal');
            });
        }

        if (reviewBtn) reviewBtn.style.display = 'none';
    }
}

// --- Init Listeners ---
export function initAuth() {
    // 1. Спочатку малюємо кнопки
    // (Подія DOMContentLoaded вже відбулася в main.js, тому можна викликати тут)
    // Але main.js викликає updateAuthArea() окремо, тому тут тільки слухачі форм.

    // Форма реєстрації
    const regForm = document.getElementById('registerForm');
    if (regForm) {
        const newRegForm = regForm.cloneNode(true);
        regForm.parentNode.replaceChild(newRegForm, regForm);
        newRegForm.addEventListener('submit', handleRegister);
    }

    // Форма входу
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const newLoginForm = loginForm.cloneNode(true);
        loginForm.parentNode.replaceChild(newLoginForm, loginForm);
        newLoginForm.addEventListener('submit', handleLogin);
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

        closeModal('loginModal');
        updateAuthArea();
        populateReviews();
        e.target.reset();

    } catch (err) {
        console.error('Login Error:', err);
        showToast(err.message || 'Невірний логін/пароль', 'error');
    }
}