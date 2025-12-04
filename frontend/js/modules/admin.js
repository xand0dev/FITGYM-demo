/* ===========================
    admin.js — Адмін-панель (Керування Розкладом, Клієнтами, Тренерами)
    =========================== */

import { BASE_URL } from './api.js';
// Припускаємо, що showToast та escapeHtml доступні в ui.js
// Вам також знадобляться функції API для POST/PUT/DELETE:
import { showToast, escapeHtml } from './ui.js'; 
import { getToken } from './auth.js'; 
// import { postAuthData, putAuthData, deleteAuthData } from './api.js'; // <-- РЕКОМЕНДОВАНО!

let currentEventId = null;
let currentCalendar = null; // Зберігаємо інстанс календаря

// --- API ХЕЛПЕР (УНІФІКОВАНИЙ) ---
// Цю функцію можна використовувати для розкладу, клієнтів та тренерів.
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

        if (response.ok || response.status === 204) { // 204 No Content для DELETE
            showToast(successMessage || `Успішно!`, 'success');
            if (currentCalendar && endpoint.includes('/schedule/')) {
                currentCalendar.refetchEvents(); // Оновлюємо лише якщо це розклад
            } 
            if(window.closeAllModals) window.closeAllModals(); 
            // 💡 Додайте тут функцію оновлення таблиць клієнтів/тренерів, якщо вони завантажуються через JS.
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


// --- API ЛОГІКА РОЗКЛАДУ (Використовує універсальний sendDataRequest) ---

/**
 * Надсилає запит до API для керування подіями розкладу (POST, PUT, DELETE).
 */
async function sendEventRequest(method, data, eventId) {
    const endpoint = `/api/schedule/` + (eventId ? eventId + '/' : '');
    const message = eventId ? 'Розклад оновлено!' : 'Нове заняття додано!';
    await sendDataRequest(method, endpoint, data, message);
}

// Функція fetchBookings залишається без змін


// --- UI ЛОГІКА РОЗКЛАДУ (showEventModal та formatDateTimeLocal залишаються без змін) ---

/**
 * Відображає модальне вікно для створення/редагування події.
 * ... (КОД showEventModal БЕЗ ЗМІН) ...
 */
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

        fetchBookings(currentEventId);

    } else {
        currentEventId = null;
        title.textContent = 'Нове Заняття';
        deleteBtn.style.display = 'none';
        partsBlock.style.display = 'none'; 

        if (eventData && eventData.start) {
            start_time = eventData.start;
            end_time = eventData.end;
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


/**
 * Форматує об'єкт Date у рядок, придатний для input[type="datetime-local"].
 * ... (КОД formatDateTimeLocal БЕЗ ЗМІН) ...
 */
function formatDateTimeLocal(date) {
    if (!date) return '';
    const dt = new Date(date);
    const offset = dt.getTimezoneOffset() * 60000;
    const localTime = new Date(dt.getTime() - offset);
    return localTime.toISOString().slice(0, 16);
}


// ===========================================
// --- НОВИЙ БЛОК: КЛІЄНТИ ---
// ===========================================

function showClientModal(clientData = null) {
    const form = document.getElementById('clientForm');
    const title = document.getElementById('clientFormTitle');
    
    // Встановлюємо display:none для deleteClientBtn у HTML!
    const deleteBtn = document.getElementById('deleteClientBtn'); 
    
    form.reset();

    if (clientData) {
        title.textContent = 'Редагувати Клієнта';
        deleteBtn.style.display = 'block';
        document.getElementById('client_id').value = clientData.id;
        document.getElementById('client_name').value = clientData.name;
        document.getElementById('client_email').value = clientData.email;
        document.getElementById('client_phone').value = clientData.phone || '';
        document.getElementById('client_status').value = clientData.status || 'Активний';
    } else {
        title.textContent = 'Додати Нового Клієнта';
        deleteBtn.style.display = 'none';
        document.getElementById('client_id').value = '';
        document.getElementById('client_status').value = 'Активний';
    }
    window.openModal('clientModal');
}

function initClientControls() {
    // 1. Кнопка "Додати Клієнта"
    const addClientBtn = document.querySelector('#section-clients .btn-primary');
    if (addClientBtn) {
        addClientBtn.addEventListener('click', () => showClientModal(null));
    }
    
    // 2. Обробка форми
    document.getElementById('clientForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const id = document.getElementById('client_id').value;
        const data = {
            name: document.getElementById('client_name').value,
            email: document.getElementById('client_email').value,
            phone: document.getElementById('client_phone').value,
            status: document.getElementById('client_status').value
        };
        
        const method = id ? 'PUT' : 'POST';
        const endpoint = id ? `/api/clients/${id}/` : '/api/clients/';

        sendDataRequest(method, endpoint, data, `Клієнт ${id ? 'оновлено' : 'додано'}!`);
    });
    
    // 3. Видалення (якщо ви додасте кнопку deleteClientBtn в HTML)
    document.getElementById('deleteClientBtn')?.addEventListener('click', () => {
        const id = document.getElementById('client_id').value;
        if (!id) return;
        
        document.getElementById('confirmModalTitle').textContent = 'Видалити клієнта?';
        document.getElementById('confirmModalBody').innerHTML = `Видалити клієнта **${escapeHtml(document.getElementById('client_name').value)}**?`;
        window.openModal('confirmModal');
        
        // Переприв'язка кнопки підтвердження
        const confirmBtn = document.getElementById('confirmActionBtn');
        const newBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

        newBtn.addEventListener('click', () => {
            if(window.closeAllModals) window.closeAllModals(); 
            sendDataRequest('DELETE', `/api/clients/${id}/`, null, 'Клієнта видалено!');
        });
    });
}


// ===========================================
// --- НОВИЙ БЛОК: ТРЕНЕРИ ---
// (Аналогічно клієнтам)
// ===========================================

function showTrainerModal(trainerData = null) {
    const form = document.getElementById('trainerForm'); // Потрібен новий ID форми в HTML
    const title = document.getElementById('trainerFormTitle'); // Потрібен новий ID заголовка
    
    const deleteBtn = document.getElementById('deleteTrainerBtn'); // Потрібен новий ID кнопки
    
    form?.reset();

    if (trainerData) {
        title.textContent = 'Редагувати Тренера';
        deleteBtn.style.display = 'block';
        document.getElementById('trainer_id').value = trainerData.id;
        document.getElementById('trainer_name').value = trainerData.name;
        document.getElementById('trainer_specialization').value = trainerData.specialization;
        document.getElementById('trainer_phone').value = trainerData.phone || '';
    } else {
        title.textContent = 'Додати Нового Тренера';
        deleteBtn.style.display = 'none';
        document.getElementById('trainer_id').value = '';
    }
    // Потрібен новий ID модалки: trainerModal
    window.openModal('trainerModal'); 
}

function initTrainerControls() {
    // 1. Кнопка "Додати Тренера"
    const addTrainerBtn = document.querySelector('#section-trainers .btn-primary');
    if (addTrainerBtn) {
        addTrainerBtn.addEventListener('click', () => showTrainerModal(null));
    }
    
    // 2. Обробка форми
    const trainerForm = document.getElementById('trainerForm');
    if (trainerForm) {
        trainerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const id = document.getElementById('trainer_id').value;
            const data = {
                name: document.getElementById('trainer_name').value,
                specialization: document.getElementById('trainer_specialization').value,
                phone: document.getElementById('trainer_phone').value,
            };
            
            const method = id ? 'PUT' : 'POST';
            const endpoint = id ? `/api/trainers/${id}/` : '/api/trainers/';

            sendDataRequest(method, endpoint, data, `Тренер ${id ? 'оновлено' : 'додано'}!`);
        });
    }

    // 3. Видалення (якщо ви додасте кнопку deleteTrainerBtn в HTML)
    document.getElementById('deleteTrainerBtn')?.addEventListener('click', () => {
        const id = document.getElementById('trainer_id').value;
        if (!id) return;
        
        document.getElementById('confirmModalTitle').textContent = 'Видалити тренера?';
        document.getElementById('confirmModalBody').innerHTML = `Видалити тренера **${escapeHtml(document.getElementById('trainer_name').value)}**?`;
        window.openModal('confirmModal');
        
        // Переприв'язка кнопки підтвердження
        const confirmBtn = document.getElementById('confirmActionBtn');
        const newBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

        newBtn.addEventListener('click', () => {
            if(window.closeAllModals) window.closeAllModals(); 
            sendDataRequest('DELETE', `/api/trainers/${id}/`, null, 'Тренера видалено!');
        });
    });
}


// ===========================================
// --- ІНІЦІАЛІЗАЦІЯ АДМІН-ПАНЕЛІ (ТОЧКА ВХОДУ) ---
// ===========================================

export function initAdminPage() {
    console.log('🚀 Admin Page Init: Initializing FullCalendar, Clients, and Trainers.');

    // 1. ІНІЦІАЛІЗАЦІЯ КАЛЕНДАРЯ (код без змін)
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
        dateClick: function(info) {
            const eventData = { 
                id: null, 
                start: info.date, 
                end: info.date.getHours() !== 0 ? new Date(info.date.getTime() + 60*60*1000) : info.date, 
                extendedProps: { class_name: '', instructor_name: '', capacity: 20 }
            };
            showEventModal(eventData);
        },
        eventDrop: function(info) {
             const data = {
                 class_name: info.event.extendedProps.class_name || info.event.title.split('(')[0].trim(),
                 instructor_name: info.event.extendedProps.instructor_name || '',
                 capacity: info.event.extendedProps.capacity || 20,
                 start_at: info.event.start.toISOString(),
                 end_at: info.event.end.toISOString(),
             };
             sendEventRequest('PUT', data, info.event.id);
        }
    });
    currentCalendar.render();

    // 2. ОБРОБНИКИ КНОПОК РОЗКЛАДУ (код без змін)
    
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

    document.getElementById('deleteEventBtn').addEventListener('click', () => {
        document.getElementById('confirmModalTitle').textContent = 'Видалити заняття?';
        document.getElementById('confirmModalBody').innerHTML = 'Видалення **' + escapeHtml(document.getElementById('class_name').value) + '** не можна скасувати.';
        if(window.openModal) window.openModal('confirmModal');

        const confirmBtn = document.getElementById('confirmActionBtn');
        const newBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

        newBtn.addEventListener('click', () => {
            if(window.closeAllModals) window.closeAllModals(); 
            sendEventRequest('DELETE', null, currentEventId);
        });
    });
    
    // 3. НОВЕ: ІНІЦІАЛІЗАЦІЯ КЛІЄНТІВ ТА ТРЕНЕРІВ! 
    initClientControls();
    initTrainerControls();
}


// Код fetchBookings залишається без змін

export async function fetchBookings(eventId) {
    const listEl = document.getElementById('bookingList');
    if (!listEl) return;
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
                html += `<li>${escapeHtml(b.user_name)} <span style="color:#666">(${escapeHtml(b.user_email)})</span></li>`; 
            });
            html += '</ul>';
            listEl.innerHTML = html;
        } else {
             listEl.innerHTML = 'Помилка завантаження. (Немає даних)';
        }
    } catch (e) {
        console.error("Booking load error:", e);
        listEl.innerHTML = 'Помилка завантаження';
    }
}