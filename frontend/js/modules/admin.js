/* ===========================
    admin.js — Адмін-панель (Логіка)
    =========================== */

import { BASE_URL } from './api.js';
import { showToast } from './admin_ui.js';
// ДОДАНО: Імпорт getUserIsStaff для перевірки прав
import { getToken, getUserIsStaff } from './auth.js';

let currentEventId = null;
let currentCalendar = null;

// --- API HELPER ---
async function sendDataRequest(method, endpoint, data, successMessage) {
    const token = getToken();
    const url = `${BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: method !== 'DELETE' ? JSON.stringify(data) : null
        });

        if (response.ok || response.status === 201 || response.status === 204) {
            showToast(successMessage || `Успішно!`, 'success');

            if (currentCalendar && endpoint.includes('schedule')) {
                currentCalendar.refetchEvents();
            }

            if(window.closeAllModals) window.closeAllModals();

            return response.status === 204 ? true : await response.json();
        } else {
            const errorData = await response.json();
            const errorMsg = errorData.detail || errorData.message || JSON.stringify(errorData) || 'Помилка API';
            showToast(errorMsg, 'error');
            console.error('API Error:', errorData);
        }
    } catch (error) {
        console.error("Network error:", error);
        showToast('Помилка мережі або сервера', 'error');
    }
}

// --- ЗАВАНТАЖЕННЯ СПИСКІВ ---
async function loadDropdownOptions() {
    const token = getToken();

    // 1. Тренери
    try {
        const resTrainers = await fetch(`${BASE_URL}/api/instructors/`, {
            headers: { 'Authorization': `Token ${token}` }
        });

        if (resTrainers.ok) {
            const trainers = await resTrainers.json();
            const select = document.getElementById('instructor_select');

            if (select) {
                select.innerHTML = '<option value="" disabled selected>Оберіть тренера</option>';
                trainers.forEach(t => {
                    const name = t.full_name || t.name || t.first_name + ' ' + t.last_name || `Тренер #${t.id}`;
                    select.innerHTML += `<option value="${t.id}">${name}</option>`;
                });
            }
        }
    } catch (e) {
        console.error("Failed to load instructors", e);
    }

    // 2. Типи занять (Classes)
    try {
        const resClasses = await fetch(`${BASE_URL}/api/classes/`, {
            headers: { 'Authorization': `Token ${token}` }
        });

        if (resClasses.ok) {
            const classes = await resClasses.json();
            const select = document.getElementById('class_select');

            if (select) {
                select.innerHTML = '<option value="" disabled selected>Оберіть тип заняття</option>';
                classes.forEach(c => {
                    const title = c.name || c.title || c.class_name || `Заняття #${c.id}`;
                    select.innerHTML += `<option value="${c.id}">${title}</option>`;
                });
            }
        }
    } catch (e) {
        console.error("Failed to load class types", e);
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

function showEventModal(eventData = null) {
    const form = document.getElementById('eventForm');
    const deleteBtn = document.getElementById('deleteEventBtn');
    const partsBlock = document.getElementById('participantsBlock');
    const title = document.getElementById('formTitle');

    const classSelect = document.getElementById('class_select');
    const instructorSelect = document.getElementById('instructor_select');

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

        if (classSelect) classSelect.value = props.class_type || '';
        if (instructorSelect) instructorSelect.value = props.instructor || '';

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

        if (classSelect) classSelect.value = "";
        if (instructorSelect) instructorSelect.value = "";

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

async function handleEventSubmit(e) {
    e.preventDefault();
    const form = e.target;

    const classSelect = document.getElementById('class_select');
    const instructorSelect = document.getElementById('instructor_select');

    const payload = {
        class_type: parseInt(classSelect.value),
        instructor: parseInt(instructorSelect.value),
        capacity: parseInt(form.capacity.value),
        start_at: new Date(form.start_at.value).toISOString(),
        end_at: new Date(form.end_at.value).toISOString(),
    };

    if (isNaN(payload.class_type) || isNaN(payload.instructor)) {
        showToast('Будь ласка, оберіть тип заняття та тренера зі списку!', 'error');
        return;
    }

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
    // --- SECURITY: ПЕРЕВІРКА НА АДМІНА ---
    // Якщо користувач не адмін або не залогінений -> показуємо 404
    const isStaff = getUserIsStaff();
    const token = getToken();

    if (!token || !isStaff) {
        document.title = '404 Not Found';
        document.body.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; background:#0a0a0a; color:#f5f5f5; font-family:'Inter', sans-serif;">
                <h1 style="font-size:6rem; margin:0; color: #333;">404</h1>
                <p style="font-size:1.5rem; color:#888;">Сторінку не знайдено</p>
                <a href="index.html" style="margin-top:20px; color:#f36100; text-decoration:none; border-bottom:1px solid #f36100;">На головну</a>
            </div>
        `;
        // Зупиняємо виконання скрипта, щоб адмінка не вантажилась
        return;
    }
    // --------------------------------------

    console.log('Admin Page Initialized');

    // 1. Завантажуємо списки
    loadDropdownOptions();

    // 2. Ініціалізація календаря
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

            events: async function(info, successCallback, failureCallback) {
                const token = getToken();
                const url = `${BASE_URL.replace(/\/$/, '')}/api/admin/schedule/?start=${info.startStr}&end=${info.endStr}`;

                try {
                    const res = await fetch(url, {
                        headers: { 'Authorization': `Token ${token}` }
                    });

                    if (!res.ok) throw new Error('Failed to fetch events');
                    const events = await res.json();

                    const mappedEvents = events.map(apiEvent => {
                        let title = `Заняття #${apiEvent.class_type}`;

                        if (apiEvent.class_name) title = apiEvent.class_name;
                        if (apiEvent.instructor_name) title += ` (${apiEvent.instructor_name})`;

                        return {
                            id: apiEvent.id,
                            title: title,
                            start: apiEvent.start_at,
                            end: apiEvent.end_at,
                            extendedProps: {
                                class_type: apiEvent.class_type,
                                instructor: apiEvent.instructor,
                                capacity: apiEvent.capacity,
                                class_name: apiEvent.class_name,
                                instructor_name: apiEvent.instructor_name
                            },
                            backgroundColor: 'var(--primary)',
                            borderColor: 'var(--primary)'
                        };
                    });

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

    const clientBtn = document.querySelector('#section-clients .btn-primary');
    if (clientBtn) clientBtn.addEventListener('click', () => window.openModal('clientModal'));

    const trainerBtn = document.querySelector('#section-trainers .btn-primary');
    if (trainerBtn) trainerBtn.addEventListener('click', () => window.openModal('trainerModal'));
}