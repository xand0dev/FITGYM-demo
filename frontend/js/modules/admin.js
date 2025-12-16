/* ===========================
    admin.js — Адмін-панель (Логіка)
    =========================== */

import { BASE_URL } from './api.js';
import { showToast } from './admin_ui.js';
import { getToken } from './auth.js';

let currentEventId = null;
let currentCalendar = null;

// --- API HELPER ---
/**
 * Універсальна функція для запитів (POST, PUT, DELETE)
 */
async function sendDataRequest(method, endpoint, data, successMessage) {
    const token = getToken();
    // Видаляємо подвійні слеші та пробіли
    const url = `${BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                // Використовуємо Token, як підтверджено у Postman
                'Authorization': `Token ${token}`
            },
            body: method !== 'DELETE' ? JSON.stringify(data) : null
        });

        if (response.ok || response.status === 201 || response.status === 204) {
            showToast(successMessage || `Успішно!`, 'success');

            // Оновлюємо календар
            if (currentCalendar && endpoint.includes('schedule')) {
                currentCalendar.refetchEvents();
            }

            if(window.closeAllModals) window.closeAllModals();

            return response.status === 204 ? true : await response.json();
        } else {
            const errorData = await response.json();
            // Спроба отримати читабельну помилку
            const errorMsg = errorData.detail || errorData.message || JSON.stringify(errorData) || 'Помилка API';
            showToast(errorMsg, 'error');
            console.error('API Error:', errorData);
        }
    } catch (error) {
        console.error("Network error:", error);
        showToast('Помилка мережі або сервера', 'error');
    }
}

// --- ЛОГІКА РОЗКЛАДУ ---

function formatDateTimeLocal(date) {
    if (!date) return '';
    const dt = new Date(date);
    const offset = dt.getTimezoneOffset() * 60000;
    const localTime = new Date(dt.getTime() - offset);
    return localTime.toISOString().slice(0, 16);
}

// Відкриття модалки
function showEventModal(eventData = null) {
    const form = document.getElementById('eventForm');
    const deleteBtn = document.getElementById('deleteEventBtn');
    const partsBlock = document.getElementById('participantsBlock');
    const title = document.getElementById('formTitle');

    form.reset();

    let start_time, end_time;

    if (eventData && eventData.id) {
        // === РЕДАГУВАННЯ ===
        currentEventId = eventData.id;
        title.textContent = 'Редагувати Заняття';
        deleteBtn.style.display = 'block';
        partsBlock.style.display = 'block';

        document.getElementById('event_id').value = eventData.id;

        const props = eventData.extendedProps || {};

        // Тут ми заповнюємо інпути.
        // ВАЖЛИВО: Зараз тут будуть ID (числа), бо ми ще не зробили select
        document.getElementById('class_name').value = props.class_type || '';
        document.getElementById('instructor_name').value = props.instructor || '';
        document.getElementById('capacity').value = props.capacity || 20;

        start_time = eventData.start;
        end_time = eventData.end;

        document.getElementById('bookingList').textContent = 'Функція списку учасників ще в розробці...';
    } else {
        // === СТВОРЕННЯ ===
        currentEventId = null;
        title.textContent = 'Нове Заняття';
        deleteBtn.style.display = 'none';
        partsBlock.style.display = 'none';

        if (eventData && eventData.start) {
            start_time = eventData.start;
            end_time = eventData.end || new Date(eventData.start.getTime() + 60 * 60 * 1000);
        } else {
            const now = new Date();
            now.setMinutes(0);
            now.setSeconds(0);
            start_time = now;
            end_time = new Date(now.getTime() + 60 * 60 * 1000);
        }
        document.getElementById('capacity').value = 20;
    }

    document.getElementById('start_at').value = formatDateTimeLocal(start_time);
    document.getElementById('end_at').value = formatDateTimeLocal(end_time);

    if(window.openModal) window.openModal('eventModal');
}

// Обробка відправки форми
async function handleEventSubmit(e) {
    e.preventDefault();
    const form = e.target;

    // ВАЖЛИВО: API очікує ID (числа) для class_type та instructor.
    // Ми використовуємо parseInt, щоб перетворити введені "1" у число 1.
    const payload = {
        class_type: parseInt(form.class_name.value),
        instructor: parseInt(form.instructor_name.value),

        capacity: parseInt(form.capacity.value),
        start_at: new Date(form.start_at.value).toISOString(),
        end_at: new Date(form.end_at.value).toISOString(),
    };

    // Перевірка на NaN (якщо користувач ввів текст замість числа)
    if (isNaN(payload.class_type) || isNaN(payload.instructor)) {
        showToast('Помилка: Введіть числові ID для типу заняття та тренера!', 'error');
        return;
    }

    // URL: api/admin/schedule/
    if (currentEventId) {
        await sendDataRequest('PUT', `api/admin/schedule/${currentEventId}/`, payload, 'Заняття оновлено!');
    } else {
        await sendDataRequest('POST', 'api/admin/schedule/', payload, 'Заняття створено!');
    }
}

async function handleDeleteEvent() {
    if (!currentEventId) return;

    await sendDataRequest('DELETE', `api/admin/schedule/${currentEventId}/`, null, 'Заняття видалено');

    if(window.closeModal) window.closeModal('confirmModal');
    if(window.closeModal) window.closeModal('eventModal');
}


// --- ІНІЦІАЛІЗАЦІЯ ---

export function initAdminPage() {
    console.log('Admin Page Initialized');

    const calendarEl = document.getElementById('calendar');

    if (calendarEl) {
        currentCalendar = new FullCalendar.Calendar(calendarEl, {
            locale: "uk",
            initialView: "timeGridWeek",
            headerToolbar: {
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek"
            },
            height: 'auto',
            navLinks: true,
            editable: true,
            selectable: true,

            // Завантаження подій через функцію (для передачі заголовка Token)
            events: async function(info, successCallback, failureCallback) {
                const token = getToken();
                const url = `${BASE_URL.replace(/\/$/, '')}/api/admin/schedule/?start=${info.startStr}&end=${info.endStr}`;

                try {
                    const res = await fetch(url, {
                        headers: { 'Authorization': `Token ${token}` }
                    });

                    if (!res.ok) throw new Error('Failed to fetch events');

                    const events = await res.json();

                    // Трансформація даних з бекенду у формат FullCalendar
                    const mappedEvents = events.map(apiEvent => ({
                        id: apiEvent.id,
                        // Відображаємо ID, бо імен поки може не бути у відповіді
                        title: `Class #${apiEvent.class_type} (Coach #${apiEvent.instructor})`,
                        start: apiEvent.start_at,
                        end: apiEvent.end_at,
                        extendedProps: {
                            class_type: apiEvent.class_type,
                            instructor: apiEvent.instructor,
                            capacity: apiEvent.capacity
                        },
                        backgroundColor: 'var(--primary)',
                        borderColor: 'var(--primary)'
                    }));

                    successCallback(mappedEvents);
                } catch (err) {
                    console.error(err);
                    failureCallback(err);
                }
            },

            eventClick: function(info) {
                info.jsEvent.preventDefault();
                showEventModal(info.event);
            },

            dateClick: function(info) {
                const eventData = {
                    id: null,
                    start: info.date,
                    end: new Date(info.date.getTime() + 60*60*1000)
                };
                showEventModal(eventData);
            },

            select: function(info) {
                const eventData = {
                    id: null,
                    start: info.start,
                    end: info.end
                };
                showEventModal(eventData);
            }
        });
        currentCalendar.render();
    }

    const addEventBtn = document.getElementById('addEventBtn');
    if (addEventBtn) addEventBtn.addEventListener('click', () => showEventModal(null));

    const eventForm = document.getElementById('eventForm');
    if (eventForm) eventForm.addEventListener('submit', handleEventSubmit);

    const deleteEventBtn = document.getElementById('deleteEventBtn');
    if (deleteEventBtn) {
        deleteEventBtn.addEventListener('click', () => {
            const confirmBtn = document.getElementById('confirmActionBtn');
            if (confirmBtn) {
                confirmBtn.onclick = handleDeleteEvent;
            }
            if(window.openModal) window.openModal('confirmModal');
        });
    }

    // Заглушки для клієнтів/тренерів
    const clientBtn = document.querySelector('#section-clients .btn-primary');
    if (clientBtn) clientBtn.addEventListener('click', () => window.openModal('clientModal'));

    const trainerBtn = document.querySelector('#section-trainers .btn-primary');
    if (trainerBtn) trainerBtn.addEventListener('click', () => window.openModal('trainerModal'));
}