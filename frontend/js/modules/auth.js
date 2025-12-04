/* ===========================
    auth.js — "Охоронець" (Автентифікація)
    =========================== */

// Використовуємо postApiData з вашого api.js
import { postApiData, getToken as getTokenFromApi } from './api.js'; 
import { showToast, closeModal, openModal, escapeHtml } from './ui.js';
// populateReviews імпортується, але не потрібна тут, якщо вона не є основною частиною аутентифікації.
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

/**
 * Зберігає токен та ім'я користувача.
 * @param {string} token - Токен автентифікації.
 * @param {string} userName - Ім'я користувача для відображення.
 */
export function saveToken(token, userName) {
    // Зберігаємо сам токен (рядок). Важливо, якщо API повертає об'єкт.
    // Приймаємо, що token може бути об'єктом { token: '...' } або просто рядком.
    const tokenValue = (typeof token === 'object' && token.token) ? token.token : token; 
    
    _set('fp_token', tokenValue);
    _set('fp_user_name', userName);
}

/**
 * Отримує токен для захищених запитів. (Якщо ви використовуєте API, токен має бути чистим рядком)
 */
export function getToken() {
    // Якщо ви перейшли на використання `getToken()` з api.js, залиште:
    // return getTokenFromApi();
    
    // Якщо ви залишаєте локальний менеджмент, то повертаємо чистий токен-рядок
    return _get('fp_token', null);
}

export function getUserName() {
    return _get('fp_user_name', null);
}

export function logoutUser() {
    localStorage.removeItem('fp_token');
    localStorage.removeItem('fp_user_name');
    
    // Перевіряємо, чи ми на адмін-панелі, інакше просто перезавантажуємо
    if (window.location.pathname.includes('admin.html')) {
        window.location.href = 'index.html'; // Перенаправляємо на головну
    } else {
        location.reload(); // Перезавантажуємо поточну сторінку
    }
}

/**
 * Оновлює зону авторизації (показує Привіт/Вхід/Реєстрація).
 */
export function updateAuthArea() {
    const area = document.getElementById('authArea');
    // Припускаємо, що reviewBtn існує на сторінці
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
                <i class="fas fa-sign-out-alt"></i> Вихід
            </button>`;

        // Слухач на Вихід
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) logoutBtn.addEventListener('click', logoutUser);

        if (reviewBtn) reviewBtn.style.display = 'inline-flex'; // Використовуйте 'inline-flex' для кнопок з іконками

    } else {
        // === GUEST (ГІСТЬ) ===
        area.innerHTML = `
            <button id="authLoginBtn" class="btn btn-ghost">ВХІД</button>
            <button id="authRegisterBtn" class="btn btn-primary">РЕЄСТРАЦІЯ</button>`;

        // ВРУЧНУ вішаємо події
        const loginBtn = document.getElementById('authLoginBtn');
        const regBtn = document.getElementById('authRegisterBtn');

        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
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
    // Очищення та повторне додавання слухачів на форми - найкращий спосіб уникнути дублювання.

    // Форма реєстрації
    const regForm = document.getElementById('registerForm');
    if (regForm) {
        // Перетворюємо у новий елемент, щоб видалити старі слухачі
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
    
    // Показуємо, що запит обробляється (опціонально: вимкнути кнопку)
    showToast('Реєстрація...', 'info'); 

    try {
        const data = await postApiData('/api/register/', {
            name, username, email, password: pass
        });

        // 💡 ВИПРАВЛЕНО: Зберігаємо ім'я, яке прийшло з API, або логін як запасний варіант
        const displayUserName = data.name || username;
        
        saveToken(data.token, displayUserName);

        showToast('Акаунт створено!', 'success');
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

    showToast('Виконуємо вхід...', 'info'); 

    try {
        const data = await postApiData('/api/login/', {
            username, password: pass
        });

        if (!data.token) throw new Error('Сервер не надіслав токен');

        // 💡 ВИПРАВЛЕНО: Якщо API не повертає 'name', використовуємо 'username' як ім'я.
        const displayUserName = data.name || username; 
        
        saveToken(data.token, displayUserName);

        showToast(`Вхід успішний! Привіт, ${displayUserName}`, 'success');
        closeModal('loginModal');
        updateAuthArea();
        populateReviews();
        e.target.reset();

    } catch (err) {
        console.error('Login Error:', err);
        showToast(err.message || 'Невірний логін/пароль', 'error');
    }
}