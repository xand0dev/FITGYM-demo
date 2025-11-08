/* ===========================
   auth.js — "Охоронець" (Автентифікація)
   =========================== */

import { postApiData } from './api.js';
import { showToast, closeModal, escapeHtml, updateAuthArea } from './ui.js';
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

// --- UI Updates ---

export { updateAuthArea }; // Експортуємо функцію, яку імпортували з ui.js

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