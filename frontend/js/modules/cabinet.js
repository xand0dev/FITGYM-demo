/* ===========================
   modules/cabinet.js — Логіка Особистого Кабінету
   =========================== */

import { getCurrentUser } from './auth.js'; 
import { showToast } from './ui.js';       
import { escapeHtml } from './ui.js'; 

const BASE_URL = 'http://127.0.0.1:8000'; 

// 💥 ФУНКЦІЯ РЕНДЕРИНГУ РОЗКЛАДУ КОРИСТУВАЧА
async function populateUserSchedule(token) {
    const list = document.getElementById('bookings-list');
    if (!list) return;
    list.innerHTML = `<p class="text-muted">Завантаження записів...</p>`;

    let bookings = [];
    try {
        const headers = { 'Authorization': `Token ${token}` };
        const response = await fetch(`${BASE_URL}/api/my-bookings/`, { headers }); 
        
        if (!response.ok) throw new Error(`Немає доступу до записів (${response.status})`);
        
        bookings = await response.json();
        
    } catch (error) {
        console.error("API Error (User Bookings):", error);
        showToast('Помилка API: Не вдалося завантажити записи.', 'error');
        // Демонстраційні дані
        bookings = [
            { session: { class_name: "Йога", instructor_name: "Олена", start_at: "2025-11-15T14:00:00" }, status: "Підтверджено" },
            { session: { class_name: "Кросфіт", instructor_name: "Іван", start_at: "2025-11-18T18:00:00" }, status: "Очікується" },
        ];
    }

    if (bookings.length === 0) {
        list.innerHTML = "<p>У вас поки що немає записів на заняття.</p>";
        return;
    }

    list.innerHTML = bookings.map(booking => `
        <div class="booking-card">
            <h4>${escapeHtml(booking.session.class_name)}</h4>
            <span>Тренер: ${escapeHtml(booking.session.instructor_name)}</span>
            <p>Коли: ${new Date(booking.session.start_at).toLocaleString('uk-UA')}</p>
            <p>Статус: <strong>${escapeHtml(booking.status)}</strong></p>
        </div>
    `).join('');
}

// ФУНКЦІЯ РЕНДЕРИНГУ ПРОФІЛЮ
async function loadProfileData(token, staticProfile) {
    const infoDiv = document.getElementById('profile-info');
    const nameEl = document.getElementById('user-name');
    const roleEl = document.getElementById('user-role');

    try {
        const headers = { 'Authorization': `Token ${token}` };
        const response = await fetch(`${BASE_URL}/api/me/`, { headers });
        
        if (!response.ok) throw new Error(`Не вдалося завантажити профіль (${response.status})`);
        
        const profile = await response.json(); 
        const userProfile = profile.user || profile[0]; // Адаптація під можливий формат API

        // Оновлення статичних даних
        nameEl.textContent = profile.full_name || staticProfile.name;
        roleEl.textContent = profile.role === 'trainer' ? 'Професійний Тренер' : 'Клієнт';

        // Вставляємо детальні дані в HTML
        infoDiv.innerHTML = `
            <p><i class="fas fa-envelope"></i> Email: <span>${escapeHtml(profile.email || staticProfile.email)}</span></p>
            <p><i class="fas fa-id-card"></i> Username: <span>${escapeHtml(profile.username || staticProfile.username)}</span></p>
            <p><i class="fas fa-dumbbell"></i> Абонемент: <span>${escapeHtml(profile.membership_status || 'Річний (PLUS)')}</span></p>
        `;

    } catch (err) {
        console.error('API Error (Profile):', err);
        showToast(`Помилка: ${err.message}. Відображаються локальні дані.`, 'error');
        // Якщо API недоступний, відображаємо дані з LocalStorage
        infoDiv.innerHTML = `
            <p><i class="fas fa-envelope"></i> Email: <span>${staticProfile.email}</span></p>
            <p><i class="fas fa-user"></i> Роль: <span>${staticProfile.role || 'Клієнт'}</span></p>
            <p><i class="fas fa-exclamation-circle"></i> Статус: <span>API Недоступний</span></p>
        `;
    }
}


//  ОСНОВНА ФУНКЦІЯ РЕНДЕРИНГУ КАБІНЕТУ
export function renderUserCabinet() {
    const user = getCurrentUser();
    
    if (!user || !user.token) { 
        window.location.href = 'index.html'; 
        return; 
    }
    
    // Оновлення статичних полів (миттєво)
    document.getElementById('user-avatar').src = user.avatar || '../img/default-avatar.png';
    document.getElementById('user-name').textContent = user.name || 'Користувач';
    document.getElementById('user-role').textContent = user.role === 'trainer' ? 'Професійний Тренер' : 'Клієнт';

    // Завантаження динамічних даних з API
    loadProfileData(user.token, user);
    populateUserSchedule(user.token);
}