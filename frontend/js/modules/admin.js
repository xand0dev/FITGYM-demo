/* ===========================
    admin.js — Адмін-панель (Модалки)
    =========================== */

import { BASE_URL } from './api.js';
import { showToast, escapeHtml } from './ui.js';
import { getToken } from './auth.js';
import { initCalendar } from './calendar.js';

let currentEventId = null;
let currentCalendar = null;

// --- API ЛОГІКА (та сама, що й була) ---

async function sendEventRequest(method, data, eventId) {
    const token = getToken();
    const url = `${BASE_URL}/api/schedule/` + (eventId ? eventId + '/' : '');

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: method !== 'DELETE' ? JSON.stringify(data) : null
        });

        if (response.ok) {
            showToast(`Успішно!`, 'success');
            currentCalendar.refetchEvents();

            // Закриваємо модалку
            if(window.closeModal) window.closeModal('eventModal');
        } else {
            const error = await response.json();
            showToast(error.detail || 'Помилка API', 'error');
        }
    } catch (error) {
        console.error(error);
        showToast('Помилка мережі', 'error');
    }
}

export async function fetchBookings(eventId) {
    const listEl = document.getElementById('bookingList');
    listEl.innerHTML = 'Завантаження...';

    const token = getToken();
    try {
        const response = await fetch(`${BASE_URL}/api/schedule/${eventId}/bookings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const bookings = await response.json();
            if (bookings.length === 0) {
                listEl.innerHTML = '<span style="color:#666">Поки немає записів</span>';
                return;
            }
            let html = '<ul>';
            bookings.forEach(b => {
                html += `<li>${escapeHtml(b.user_name)} <span style="color:#666">(${b.user_email})</span></li>`;
            });
            html += '</ul>';
            listEl.innerHTML = html;
        }
    } catch (e) {
        listEl.innerHTML = 'Помилка завантаження';
    }
}


// --- UI ЛОГІКА (МОДАЛКИ) ---

function showEventModal(eventData = null) {
    const form = document.getElementById('eventForm');
    const deleteBtn = document.getElementById('deleteEventBtn');
    const partsBlock = document.getElementById('participantsBlock');
    const title = document.getElementById('formTitle');

    form.reset();

    if (eventData) {
        // РЕДАГУВАННЯ
        currentEventId = eventData.id;
        title.textContent = 'Редагувати Заняття';
        deleteBtn.style.display = 'block';
        partsBlock.style.display = 'block';

        document.getElementById('event_id').value = eventData.id;
        document.getElementById('class_name').value = eventData.extendedProps.class_name || eventData.title.split('(')[0].trim();
        document.getElementById('instructor_name').value = eventData.extendedProps.instructor_name || '';
        document.getElementById('capacity').value = eventData.extendedProps.capacity || 20;

        document.getElementById('start_at').value = formatDateTimeLocal(eventData.start);
        document.getElementById('end_at').value = formatDateTimeLocal(eventData.end);

        // Завантажуємо список людей
        fetchBookings(currentEventId);

    } else {
        // СТВОРЕННЯ
        currentEventId = null;
        title.textContent = 'Нове Заняття';
        deleteBtn.style.display = 'none';
        partsBlock.style.display = 'none'; // Ховаємо список людей

        // Дефолтний час (найближча година)
        const now = new Date();
        now.setMinutes(0);
        document.getElementById('start_at').value = formatDateTimeLocal(now);
        now.setHours(now.getHours() + 1);
        document.getElementById('end_at').value = formatDateTimeLocal(now);
    }

    // Відкриваємо модалку (використовуємо глобальну функцію з ui.js)
    if(window.openModal) window.openModal('eventModal');
}

function formatDateTimeLocal(date) {
    if (!date) return '';
    const dt = new Date(date);
    const offset = dt.getTimezoneOffset() * 60000;
    const localTime = new Date(dt.getTime() - offset);
    return localTime.toISOString().slice(0, 16);
}

// --- ІНІЦІАЛІЗАЦІЯ ---

export function initAdminPage() {
    console.log('Admin Page Init');

    // 1. Календар
    const calendarEl = document.getElementById('calendar');

    // Ми підміняємо стандартний initCalendar на свій конфіг тут, або передаємо колбек
    // Але щоб не ламати логіку calendar.js, зробимо хитріше:
    // Ми використовуємо ту саму функцію, але FullCalendar дозволяє клікати по датах.

    // Ініціалізуємо календар (режим адміна = true)
    // Тобі треба трохи підправити calendar.js, щоб він приймав click handler,
    // АБО ми просто тут його створимо вручну, якщо initCalendar не гнучкий.
    // Давай використаємо існуючий initCalendar, але він має вміти відкривати нашу модалку.

    // Щоб все було просто: я ініціалізую календар ПРЯМО ТУТ для адмінки.
    // Це дасть нам повний контроль над кліками.

    currentCalendar = new FullCalendar.Calendar(calendarEl, {
        locale: "uk",
        initialView: "timeGridWeek",
        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek"
        },
        height: 'auto',
        events: `${BASE_URL}/api/schedule/`,

        // Клік по події -> Редагувати
        eventClick: function(info) {
            info.jsEvent.preventDefault();
            showEventModal(info.event);
        },

        // Клік по порожньому місцю -> Створити (Optional)
        dateClick: function(info) {
            // Можна відкрити форму з передзаповненим часом
            // showEventModal(null, info.date);
        }
    });
    currentCalendar.render();

    // 2. Кнопки
    document.getElementById('addEventBtn').addEventListener('click', () => showEventModal(null));

    document.getElementById('eventForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.target;

        const data = {
            class_name: form.class_name.value,
            instructor_name: form.instructor_name.value,
            capacity: form.capacity.value,
            start_at: new Date(form.start_at.value).toISOString(),
            end_at: new Date(form.end_at.value).toISOString(),
        };

        if (currentEventId) {
            sendEventRequest('PUT', data, currentEventId);
        } else {
            sendEventRequest('POST', data, null);
        }
    });

    // Видалення
    document.getElementById('deleteEventBtn').addEventListener('click', () => {
        // Відкриваємо підтвердження
        if(window.openModal) window.openModal('confirmModal');

        const confirmBtn = document.getElementById('confirmActionBtn');
        const newBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

        newBtn.addEventListener('click', () => {
            if(window.closeModal) window.closeModal('confirmModal');
            sendEventRequest('DELETE', null, currentEventId);
        });
    });
}