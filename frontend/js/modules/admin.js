/* ===========================
    admin.js — Адмін-панель (Керування Розкладом, Клієнтами, Тренерами)
    =========================== */

import { BASE_URL } from './api.js';
// 💡 Імпортуємо з нового UI-модуля
import { showToast, escapeHtml } from './admin_ui.js'; 
import { getToken } from './auth.js'; 

let currentEventId = null;
let currentCalendar = null;
// Потрібні для логіки клієнтів/тренерів, якщо будете додавати редагування/видалення
// let currentClientId = null; 
// let currentTrainerId = null; 

// --- API ХЕЛПЕР (УНІФІКОВАНИЙ) ---
// Використовуйте цю функцію для всіх POST/PUT/DELETE
async function sendDataRequest(method, endpoint, data, successMessage) {
    const token = getToken();
    const url = `${BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: method !== 'DELETE' ? JSON.stringify(data) : null
        });

        if (response.ok || response.status === 204) { 
            showToast(successMessage || `Успішно!`, 'success');
            if (currentCalendar && endpoint.includes('/schedule/')) {
                currentCalendar.refetchEvents();
            } 
            if(window.closeAllModals) window.closeAllModals(); 
            return await (response.status !== 204 ? response.json() : true);
        } else {
            const error = await response.json();
            showToast(error.detail || 'Помилка API. Перевірте авторизацію.', 'error');
        }
    } catch (error) {
        console.error("Network or parsing error:", error);
        showToast('Помилка мережі або системи', 'error');
    }
}

// --- ЛОГІКА РОЗКЛАДУ ---
async function sendEventRequest(method, data, eventId) {
    const endpoint = `/api/schedule/` + (eventId ? eventId + '/' : '');
    const message = eventId ? 'Розклад оновлено!' : 'Нове заняття додано!';
    await sendDataRequest(method, endpoint, data, message);
}

// ... (fetchBookings, showEventModal, formatDateTimeLocal - без змін) ...
function formatDateTimeLocal(date) {
    if (!date) return '';
    const dt = new Date(date);
    const offset = dt.getTimezoneOffset() * 60000;
    const localTime = new Date(dt.getTime() - offset);
    return localTime.toISOString().slice(0, 16);
}

// Функція showEventModal тут
function showEventModal(eventData = null) {
    const form = document.getElementById('eventForm');
    const deleteBtn = document.getElementById('deleteEventBtn');
    const partsBlock = document.getElementById('participantsBlock');
    const title = document.getElementById('formTitle');

    form.reset();

    let start_time, end_time;

    if (eventData && eventData.id) {
        currentEventId = eventData.id;
        title.textContent = 'Редагувати Заняття';
        deleteBtn.style.display = 'block';
        partsBlock.style.display = 'block';

        document.getElementById('event_id').value = eventData.id;
        document.getElementById('class_name').value = eventData.extendedProps.class_name || eventData.title.split('(')[0].trim();
        document.getElementById('instructor_name').value = eventData.extendedProps.instructor_name || '';
        document.getElementById('capacity').value = eventData.extendedProps.capacity || 20;

        start_time = eventData.start;
        end_time = eventData.end;

        // Завантажуємо список людей
        // fetchBookings(currentEventId); // Розкоментувати, якщо потрібно
    } else {
        currentEventId = null;
        title.textContent = 'Нове Заняття';
        deleteBtn.style.display = 'none';
        partsBlock.style.display = 'none';

        if (eventData && eventData.start) {
            start_time = eventData.start;
            end_time = eventData.end || new Date(eventData.start.getTime() + 60 * 60 * 1000); // Додати 1 годину
        } else {
            const now = new Date();
            now.setMinutes(0);
            start_time = now;
            end_time = new Date(now.getTime() + 60 * 60 * 1000);
        }
        document.getElementById('capacity').value = 20;
    }

    document.getElementById('start_at').value = formatDateTimeLocal(start_time);
    document.getElementById('end_at').value = formatDateTimeLocal(end_time);

    if(window.openModal) window.openModal('eventModal');
}


// --- ЛОГІКА КЛІЄНТІВ ТА ТРЕНЕРІВ ---

function showClientModal(clientData = null) {
    // ... (реалізація модалки клієнтів) ...
    window.openModal('clientModal');
}

function initClientControls() {
    document.querySelector('#section-clients .btn-primary')?.addEventListener('click', () => showClientModal(null));
    document.getElementById('clientForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        sendDataRequest('POST', '/api/clients/', {/* data */}, 'Клієнт доданий!');
    });
}

function showTrainerModal(trainerData = null) {
    // ... (реалізація модалки тренерів) ...
    window.openModal('trainerModal');
}

function initTrainerControls() {
    document.querySelector('#section-trainers .btn-primary')?.addEventListener('click', () => showTrainerModal(null));
    document.getElementById('trainerForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        sendDataRequest('POST', '/api/trainers/', {/* data */}, 'Тренер доданий!');
    });
}


// --- ІНІЦІАЛІЗАЦІЯ (ТОЧКА ВХОДУ) ---

export function initAdminPage() {
    console.log('Admin Page Init');

    // 1. Календар
    const calendarEl = document.getElementById('calendar');

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
        editable: true,

        eventClick: function(info) {
            info.jsEvent.preventDefault();
            showEventModal(info.event);
        },

        // 💡 АКТИВОВАНО: Клік по порожньому місцю -> Створити
        dateClick: function(info) {
             const eventData = { 
                id: null, 
                start: info.date, 
                end: new Date(info.date.getTime() + 60*60*1000), 
                extendedProps: { class_name: '', instructor_name: '', capacity: 20 }
             };
             showEventModal(eventData);
        }
    });
    currentCalendar.render();

    // 2. Обробники кнопок
    document.getElementById('addEventBtn').addEventListener('click', () => showEventModal(null));
    
    document.getElementById('eventForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.target;
        const data = {
            class_name: form.class_name.value,
            instructor_name: form.instructor_name.value,
            capacity: parseInt(form.capacity.value),
            start_at: new Date(form.start_at.value).toISOString(),
            end_at: new Date(form.end_at.value).toISOString(),
        };

        if (currentEventId) {
            sendEventRequest('PUT', data, currentEventId);
        } else {
            sendEventRequest('POST', data, null);
        }
    });

    document.getElementById('deleteEventBtn')?.addEventListener('click', () => {
        if(window.openModal) window.openModal('confirmModal');
        // ... (логіка підтвердження видалення)
    });
    
    // 3. Ініціалізація нових модулів
    initClientControls();
    initTrainerControls();
}