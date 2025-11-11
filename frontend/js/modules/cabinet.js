/* ===========================
   modules/cabinet.js — "Диригент" Особистого Кабінету
   =========================== */

// Імпортуємо потрібні нам функції з інших модулів
import { getToken, getUserName, logoutUser, updateAuthArea, initAuth } from './auth.js';
import { showToast, escapeHtml, initModalLogic, setupHamburger, setupSmoothScrolling } from './ui.js';

// Адреса нашого бекенду
const BASE_URL = 'http://127.0.0.1:8000';

/**
 * 🌟 "Охоронець" (Guard) 🌟
 * Ця функція - точка входу. Вона запускається одразу.
 */
document.addEventListener('DOMContentLoaded', () => {

    const token = getToken();
    const userName = getUserName();

    // 1. Перевірка "фейс-контролю"
    if (!token) {
        alert("Доступ заборонено! Будь ласка, увійдіть.");
        window.location.href = 'index.html'; // Перекидаємо на головну
        return; // Зупиняємо виконання
    }

    // 2. Якщо токен є - заповнюємо сторінку
    console.log("Доступ дозволено. Завантажую дані кабінету...");

    // 3. Ініціалізуємо UI (Хедер, гамбургер)
    initModalLogic();      // Налаштовує кнопки закриття модалок (на випадок, якщо вони нам знадобляться)
    setupSmoothScrolling();  // Плавний скрол (для посилань на index.html)
    setupHamburger();      // Меню-гамбургер
    updateAuthArea();      // Оновлює хедер (показує "Привіт, ... / Вихід")
    initAuth();            // (Потрібно, щоб "showModal" працював, якщо він в хедері)

    // 4. Миттєво заповнюємо тим, що маємо (щоб не було "Завантаження...")
    document.getElementById('user-name').textContent = userName;
    document.getElementById('user-role').textContent = 'Клієнт'; // (Поки що так)
    document.getElementById('user-avatar').src = 'img/муж1.png'; // (Заглушка)

    // Навішуємо "прослушку" на кнопку виходу
    document.getElementById('logoutButton').addEventListener('click', logoutUser);

    // 5. Запускаємо асинхронне завантаження даних з API
    loadProfileData(token);
    populateUserSchedule(token);

    // 6. Ініціалізуємо AOS (анімації)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true
        });
    }
});


/**
 * ФУНКЦІЯ РЕНДЕРИНГУ ПРОФІЛЮ
 * (Бере токен, йде на /api/me/ і заповнює деталі)
 */
async function loadProfileData(token) {
    const infoDiv = document.getElementById('profile-info');
    if (!infoDiv) return;

    try {
        const headers = { 'Authorization': `Token ${token}` };
        const response = await fetch(`${BASE_URL}/api/me/`, { headers });

        if (!response.ok) {
            // Якщо 401 (Unauthorized), токен "протух", виходимо
            if (response.status === 401) {
                showToast('Сесія застаріла. Будь ласка, увійдіть знову.', 'error');
                logoutUser();
                return;
            }
            throw new Error(`Помилка: ${response.status}`);
        }

        const profileData = await response.json();

        // 'profileData' - це масив [{}]. Нам потрібен перший елемент.
        const userProfile = profileData[0];

        if (!userProfile) throw new Error('API повернув порожній профіль');

        // Вставляємо детальні дані в HTML
        infoDiv.innerHTML = `
            <p><i class="fas fa-envelope"></i> Email: <span>${escapeHtml(userProfile.email)}</span></p>
            <p><i class="fas fa-id-card"></i> Username: <span>${escapeHtml(userProfile.username)}</span></p>
            <p><i class="fas fa-phone"></i> Контакт: <span>${escapeHtml(userProfile.contact || 'Не вказано')}</span></p>
            <p><i class="fas fa-dumbbell"></i> Статус: <span>${escapeHtml(userProfile.status)}</span></p>
        `;

        // Також оновлюємо ім'я в хедері картки
        document.getElementById('user-name').textContent = userProfile.full_name;

    } catch (err) {
        console.error('API Error (Profile):', err);
        showToast(`Помилка завантаження профілю.`, 'error');
        infoDiv.innerHTML = `<p class="text-muted">Не вдалося завантажити дані профілю.</p>`;
    }
}


/**
 * ФУНКЦІЯ РЕНДЕРИНГУ ЗАПИСІВ КОРИСТУВАЧА
 * (Бере токен, йде на /api/my-bookings/ і малює список)
 */
async function populateUserSchedule(token) {
    const list = document.getElementById('bookings-list');
    if (!list) return;
    list.innerHTML = `<p class="text-muted">Завантаження записів...</p>`;

    try {
        const headers = { 'Authorization': `Token ${token}` };
        const response = await fetch(`${BASE_URL}/api/my-bookings/`, { headers });

        if (!response.ok) throw new Error(`Не вдалося завантажити записи (${response.status})`);

        const bookings = await response.json();

        if (bookings.length === 0) {
            list.innerHTML = "<p>У вас поки що немає записів на заняття.</p>";
            return;
        }

        // Малюємо картки записів
        list.innerHTML = bookings.map(booking => {
            // 'booking.session' - це вкладений об'єкт ClassSessionSerializer
            const session = booking.session;
            return `
            <div class="booking-card">
                <h4>${escapeHtml(session.class_name)}</h4>
                <span>Тренер: ${escapeHtml(session.instructor_name || 'Н/Д')}</span>
                <p>Коли: ${new Date(session.start_at).toLocaleString('uk-UA', {dateStyle: 'short', timeStyle: 'short'})}</p>
                <p>Статус: <strong>${escapeHtml(booking.status)}</strong></p>
            </div>
            `
        }).join('');

    } catch (error) {
        console.error("API Error (User Bookings):", error);
        showToast('Помилка API: Не вдалося завантажити записи.', 'error');
        list.innerHTML = `<p class="text-muted">Помилка завантаження.</p>`;
    }
}