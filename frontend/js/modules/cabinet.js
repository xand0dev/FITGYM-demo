/* ===========================
   modules/cabinet.js — Особистий Кабінет
   =========================== */

import { getToken, getUserName, logoutUser, updateAuthArea, initAuth } from './auth.js';
import { showToast, escapeHtml, initModalLogic, setupHamburger } from './ui.js';
import { getApiData, deleteAuthData } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const token = getToken();
    const userName = getUserName();

    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // Init UI
    initModalLogic();
    setupHamburger();
    updateAuthArea();
    initAuth();

    // Static Data
    const nameEl = document.getElementById('user-name');
    if (nameEl) nameEl.textContent = userName || 'Клієнт';

    const logoutBtn = document.getElementById('logoutButton');
    if (logoutBtn) logoutBtn.addEventListener('click', logoutUser);

    // Load Data
    loadProfileData();
    populateUserSchedule();

    // Ініціалізуємо обробник кнопок "Скасувати"
    setupCancelHandler();

    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, once: true });
    }
});

/* --- API LOADERS --- */

async function loadProfileData() {
    const infoDiv = document.getElementById('profile-info');
    if (!infoDiv) return;

    try {
        // ВИПРАВЛЕНО: Використовуємо getApiData
        const profileData = await getApiData('/api/me/');
        const userProfile = Array.isArray(profileData) ? profileData[0] : profileData;

        if (!userProfile) throw new Error('Empty profile data');

        infoDiv.innerHTML = `
            <p><i class="fas fa-envelope"></i> Email: <span>${escapeHtml(userProfile.email)}</span></p>
            <p><i class="fas fa-id-card"></i> Логін: <span>${escapeHtml(userProfile.username)}</span></p>
            <p><i class="fas fa-phone"></i> Телефон: <span>${escapeHtml(userProfile.phone || userProfile.contact || '—')}</span></p>
            <p><i class="fas fa-user-tag"></i> Статус: <span style="color: var(--accent)">${escapeHtml(userProfile.status || 'Active')}</span></p>
        `;
        if (userProfile.full_name) {
            document.getElementById('user-name').textContent = userProfile.full_name;
        }

    } catch (err) {
        console.error('Profile Error:', err);
        if (err.message === 'Unauthorized') {
            logoutUser();
        } else {
            infoDiv.innerHTML = `<p class="text-muted">Не вдалося завантажити дані.</p>`;
        }
    }
}

async function populateUserSchedule() {
    const list = document.getElementById('bookings-list');
    if (!list) return;

    list.innerHTML = `<p class="text-muted">Оновлення списку...</p>`;

    try {
        // ВИПРАВЛЕНО: Використовуємо getApiData
        const bookings = await getApiData('/api/my-bookings/');

        if (!Array.isArray(bookings) || bookings.length === 0) {
            list.innerHTML = "<p>У вас поки немає активних записів.</p>";
            return;
        }

        list.innerHTML = bookings.map(booking => {
            const session = booking.session || booking;
            const dateObj = new Date(session.start_at);
            const dateStr = dateObj.toLocaleDateString('uk-UA', {day: 'numeric', month: 'long'});
            const timeStr = dateObj.toLocaleTimeString('uk-UA', {hour: '2-digit', minute:'2-digit'});

            return `
            <div class="booking-card" data-aos="fade-up">
                <div class="booking-info">
                    <h4>${escapeHtml(session.class_name || 'Тренування')}</h4>
                    <p><strong>${dateStr}</strong> о <strong>${timeStr}</strong></p>
                    <span>Тренер: ${escapeHtml(session.instructor_name || '—')}</span>
                    <p class="status-text">Статус: ${escapeHtml(booking.status || 'Підтверджено')}</p>
                </div>
                
                <button class="btn-cancel" data-booking-id="${booking.id}" title="Скасувати запис">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
            `;
        }).join('');

    } catch (error) {
        console.error("Bookings Error:", error);
        list.innerHTML = `<p class="text-muted">Помилка завантаження розкладу.</p>`;
    }
}

/* --- CANCEL LOGIC --- */

function setupCancelHandler() {
    const list = document.getElementById('bookings-list');
    if (!list) return;

    list.addEventListener('click', async (e) => {
        const btn = e.target.closest('.btn-cancel');

        if (btn) {
            const bookingId = btn.getAttribute('data-booking-id');
            const card = btn.closest('.booking-card');

            await handleCancelBooking(bookingId, card);
        }
    });
}

async function handleCancelBooking(id, cardElement) {
    if (!confirm('Ви впевнені, що хочете скасувати це тренування?')) return;

    try {
        await deleteAuthData(`/api/my-bookings/${id}/`);

        cardElement.style.transition = 'all 0.3s ease';
        cardElement.style.opacity = '0';
        cardElement.style.transform = 'translateX(20px)';

        setTimeout(() => {
            cardElement.remove();
            const list = document.getElementById('bookings-list');
            if (list && list.children.length === 0) {
                list.innerHTML = "<p>У вас немає активних записів.</p>";
            }
        }, 300);

        showToast('Бронювання скасовано успішно', 'success');

    } catch (error) {
        console.error('Cancel Error:', error);
        showToast(error.message || 'Не вдалося скасувати запис', 'error');
    }
}