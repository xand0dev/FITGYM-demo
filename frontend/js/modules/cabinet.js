/* ===========================
   modules/cabinet.js — Особистий Кабінет
   =========================== */

import { getToken, getUserName, logoutUser, updateAuthArea, initAuth } from './auth.js';
import { showToast, escapeHtml, initModalLogic, setupHamburger } from './ui.js';
import { getAuthData } from './api.js'; // Імпортуємо getAuthData

document.addEventListener('DOMContentLoaded', () => {

    const token = getToken();
    const userName = getUserName();

    // 1. Guard check
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    console.log("Cabinet initialized.");

    // 2. Init UI
    initModalLogic();
    setupHamburger();
    updateAuthArea();
    initAuth();

    // 3. Set Static Data
    const nameEl = document.getElementById('user-name');
    if (nameEl) nameEl.textContent = userName || 'Клієнт';

    // Logout Handler
    const logoutBtn = document.getElementById('logoutButton');
    if (logoutBtn) logoutBtn.addEventListener('click', logoutUser);

    // 4. Load Async Data
    loadProfileData();
    populateUserSchedule();

    // AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, once: true });
    }
});


/**
 * Завантаження профілю (/api/me/)
 */
async function loadProfileData() {
    const infoDiv = document.getElementById('profile-info');
    if (!infoDiv) return;

    try {
        // Використовуємо getAuthData - вона сама додає токен і обробляє 401
        const profileData = await getAuthData('/api/me/');

        // Перевірка: чи це масив, чи об'єкт (Django ViewSet може повертати List)
        const userProfile = Array.isArray(profileData) ? profileData[0] : profileData;

        if (!userProfile) throw new Error('Empty profile data');

        infoDiv.innerHTML = `
            <p><i class="fas fa-envelope"></i> Email: <span>${escapeHtml(userProfile.email)}</span></p>
            <p><i class="fas fa-id-card"></i> Логін: <span>${escapeHtml(userProfile.username)}</span></p>
            <p><i class="fas fa-phone"></i> Телефон: <span>${escapeHtml(userProfile.phone || userProfile.contact || '—')}</span></p>
            <p><i class="fas fa-user-tag"></i> Статус: <span style="color: var(--accent)">${escapeHtml(userProfile.status || 'Active')}</span></p>
        `;

        // Оновлюємо ім'я, якщо воно прийшло з сервера
        if (userProfile.full_name || userProfile.name) {
            document.getElementById('user-name').textContent = userProfile.full_name || userProfile.name;
        }

    } catch (err) {
        console.error('Profile Load Error:', err);

        if (err.message === 'Unauthorized') {
            showToast('Сесія закінчилась', 'error');
            logoutUser();
        } else {
            infoDiv.innerHTML = `<p class="text-muted">Не вдалося завантажити дані.</p>`;
        }
    }
}


/**
 * Завантаження бронювань (/api/my-bookings/)
 */
async function populateUserSchedule() {
    const list = document.getElementById('bookings-list');
    if (!list) return;

    list.innerHTML = `<p class="text-muted">Оновлення списку...</p>`;

    try {
        const bookings = await getAuthData('/api/my-bookings/');

        if (!Array.isArray(bookings) || bookings.length === 0) {
            list.innerHTML = "<p>У вас поки немає активних записів.</p>";
            return;
        }

        list.innerHTML = bookings.map(booking => {
            // Адаптуємо під можливі формати відповіді (вкладений session або плоский об'єкт)
            const session = booking.session || booking;
            const dateObj = new Date(session.start_at);

            const dateStr = dateObj.toLocaleDateString('uk-UA', {day: 'numeric', month: 'long'});
            const timeStr = dateObj.toLocaleTimeString('uk-UA', {hour: '2-digit', minute:'2-digit'});

            return `
            <div class="booking-card" data-aos="fade-up">
                <h4>${escapeHtml(session.class_name || 'Тренування')}</h4>
                <p><strong>${dateStr}</strong> о <strong>${timeStr}</strong></p>
                <span>Тренер: ${escapeHtml(session.instructor_name || '—')}</span>
                <p style="margin-top:5px; font-size:0.8rem; color: #888;">
                   Статус: ${escapeHtml(booking.status || 'Підтверджено')}
                </p>
            </div>
            `;
        }).join('');

    } catch (error) {
        console.error("Bookings Load Error:", error);
        list.innerHTML = `<p class="text-muted">Помилка завантаження розкладу.</p>`;
    }
}