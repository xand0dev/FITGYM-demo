/* ===========================
    admin.js — Адмін-панель (Логіка)
    =========================== */

import { BASE_URL } from './api.js';
import { showToast, escapeHtml } from './admin_ui.js';
import { getToken, getUserIsStaff } from './auth.js';

// --- STATE ---
let currentEventId = null;
let currentCalendar = null;

let currentClientId = null;
let currentTrainerId = null;

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

            // Оновлюємо відповідну секцію залежно від ендпоінту
            if (endpoint.includes('schedule')) {
                if (currentCalendar) currentCalendar.refetchEvents();
            } else if (endpoint.includes('members')) {
                loadClientsTable();
            } else if (endpoint.includes('instructors')) {
                loadTrainersTable();
                loadDropdownOptions(); // Оновити також список у селекті розкладу
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

// ==========================================
// 1. ЛОГІКА КЛІЄНТІВ (MEMBERS) - ОНОВЛЕНО
// ==========================================

async function loadClientsTable() {
    const tbody = document.getElementById('clientsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Завантаження...</td></tr>';

    try {
        const token = getToken();
        // Використовуємо новий адмінський ендпоінт
        const res = await fetch(`${BASE_URL}/api/admin/members/`, {
            headers: { 'Authorization': `Token ${token}` }
        });

        if (res.ok) {
            const clients = await res.json();
            renderClientsTable(clients);
        } else {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center error">Не вдалося завантажити дані</td></tr>';
        }
    } catch (e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center error">Мережева помилка</td></tr>';
    }
}

function renderClientsTable(clients) {
    const tbody = document.getElementById('clientsTableBody');
    if (!tbody) return;

    if (!Array.isArray(clients) || clients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Список порожній</td></tr>';
        return;
    }

    tbody.innerHTML = clients.map(c => {
        // Дані з бекенду: full_name, user_email, contact, status
        const name = escapeHtml(c.full_name || c.username || 'Без імені');
        const email = escapeHtml(c.user_email || c.email || '—');
        const contact = escapeHtml(c.contact || c.phone || '—');

        // Стилізація статусу
        let statusColor = '#888';
        let statusText = c.status || 'Active';
        if (statusText === 'active') statusColor = 'var(--accent)';
        else if (statusText === 'frozen') statusColor = '#3498db';

        return `
        <tr>
            <td data-label="Ім'я"><strong>${name}</strong></td>
            <td data-label="Email">${email}</td>
            <td data-label="Телефон">${contact}</td>
            <td data-label="Статус">
                <span style="color: ${statusColor}">${escapeHtml(statusText)}</span>
            </td>
            <td data-label="Дії">
                <button class="action-btn edit-client-btn" data-json='${JSON.stringify(c).replace(/'/g, "&#39;")}' title="Редагувати">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `}).join('');

    // Прив'язка подій редагування
    document.querySelectorAll('.edit-client-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const data = JSON.parse(btn.getAttribute('data-json'));
            showClientModal(data);
        });
    });
}

function showClientModal(clientData = null) {
    const form = document.getElementById('clientForm');
    const deleteBtn = document.getElementById('deleteClientBtn');
    const title = document.getElementById('clientFormTitle');

    // Блок авторизації
    const authFields = document.getElementById('clientAuthFields');

    form.reset();

    if (clientData && clientData.id) {
        // === EDIT (Редагування) ===
        currentClientId = clientData.id;
        title.textContent = 'Редагувати Клієнта';
        deleteBtn.style.display = 'block';

        // При редагуванні ховаємо логін/пароль
        if (authFields) authFields.style.display = 'none';
        document.getElementById('client_username').removeAttribute('required');
        document.getElementById('client_password').removeAttribute('required');

        // Заповнюємо поля
        document.getElementById('client_id').value = clientData.id;
        document.getElementById('client_name').value = clientData.full_name || '';
        document.getElementById('client_email').value = clientData.user_email || clientData.email || '';
        document.getElementById('client_phone').value = clientData.contact || '';
        document.getElementById('client_status').value = clientData.status || 'active';

        // Робимо ім'я та email "тільки для читання", оскільки бек їх не оновлює через цей PUT
        document.getElementById('client_email').setAttribute('readonly', true);
        document.getElementById('client_name').setAttribute('readonly', true);
        document.getElementById('client_email').style.opacity = '0.6';
        document.getElementById('client_name').style.opacity = '0.6';

    } else {
        // === CREATE (Створення) ===
        currentClientId = null;
        title.textContent = 'Новий Клієнт';
        deleteBtn.style.display = 'none';

        // Показуємо і вимагаємо логін/пароль
        if (authFields) authFields.style.display = 'block';
        document.getElementById('client_username').setAttribute('required', 'true');
        document.getElementById('client_password').setAttribute('required', 'true');

        // Робимо поля доступними
        document.getElementById('client_email').removeAttribute('readonly');
        document.getElementById('client_name').removeAttribute('readonly');
        document.getElementById('client_email').style.opacity = '1';
        document.getElementById('client_name').style.opacity = '1';

        document.getElementById('client_status').value = 'active';
    }

    if(window.openModal) window.openModal('clientModal');
}

async function handleClientSubmit(e) {
    e.preventDefault();
    const form = e.target;

    const contact = form.client_phone.value;
    const status = form.client_status.value;

    if (currentClientId) {
        // === PUT (Редагування) ===
        const payload = {
            contact: contact,
            status: status
        };
        await sendDataRequest('PUT', `api/admin/members/${currentClientId}/`, payload, 'Дані клієнта оновлено');
    } else {
        // === POST (Створення) ===

        // Розбиваємо ім'я
        const fullName = form.client_name.value.trim();
        // Розділяємо по будь-якій кількості пробілів
        const nameParts = fullName.split(/\s+/);
        const firstName = nameParts[0];
        // Якщо прізвища немає, ставимо "-" щоб сервер не сварився, або беремо решту слів
        const lastName = nameParts.slice(1).join(' ') || '-';

        // Валідація Email на стороні клієнта (проста)
        const email = form.client_email.value;
        if (!email.includes('@') || !email.includes('.')) {
            showToast('Введіть коректний Email (напр. user@mail.com)', 'error');
            return;
        }

        const payload = {
            username: form.client_username.value,
            password: form.client_password.value,
            email: email,
            first_name: firstName,
            last_name: lastName, // Тепер тут ніколи не буде пусто
            contact: contact,
            status: status
        };
        await sendDataRequest('POST', 'api/admin/members/', payload, 'Клієнта створено');
    }
}

async function handleDeleteClient() {
    if (!currentClientId) return;
    await sendDataRequest('DELETE', `api/admin/members/${currentClientId}/`, null, 'Клієнта видалено');
    if(window.closeModal) window.closeModal('confirmModal');
    if(window.closeModal) window.closeModal('clientModal');
}


// ==========================================
// 2. ЛОГІКА ТРЕНЕРІВ (INSTRUCTORS)
// ==========================================

async function loadTrainersTable() {
    const tbody = document.getElementById('trainersTableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="4" class="text-center">Завантаження...</td></tr>';

    try {
        const token = getToken();
        const res = await fetch(`${BASE_URL}/api/admin/instructors/`, {
            headers: { 'Authorization': `Token ${token}` }
        });

        if (res.ok) {
            const trainers = await res.json();
            renderTrainersTable(trainers);
        } else {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center error">Помилка завантаження</td></tr>';
        }
    } catch (e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="4" class="text-center error">Мережева помилка</td></tr>';
    }
}

function renderTrainersTable(trainers) {
    const tbody = document.getElementById('trainersTableBody');
    if (!tbody) return;

    if (!Array.isArray(trainers) || trainers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Список порожній</td></tr>';
        return;
    }

    tbody.innerHTML = trainers.map(t => `
        <tr>
            <td data-label="Ім'я"><strong>${escapeHtml(t.full_name || t.name || t.first_name + ' ' + t.last_name)}</strong></td>
            <td data-label="Спеціалізація">${escapeHtml(t.specialties || t.specialization || '—')}</td>
            <td data-label="Телефон">${escapeHtml(t.contact || t.phone || '—')}</td>
            <td data-label="Дії">
                <button class="action-btn edit-trainer-btn" data-json='${JSON.stringify(t).replace(/'/g, "&#39;")}' title="Редагувати">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');

    document.querySelectorAll('.edit-trainer-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const data = JSON.parse(btn.getAttribute('data-json'));
            showTrainerModal(data);
        });
    });
}

function showTrainerModal(data = null) {
    const form = document.getElementById('trainerForm');
    const deleteBtn = document.getElementById('deleteTrainerBtn');
    const title = document.getElementById('trainerFormTitle');
    const authFields = document.getElementById('trainerAuthFields');

    form.reset();

    if (data && data.id) {
        // === EDIT ===
        currentTrainerId = data.id;
        title.textContent = 'Редагувати Тренера';
        deleteBtn.style.display = 'block';

        if (authFields) authFields.style.display = 'none';
        document.getElementById('trainer_username').removeAttribute('required');
        document.getElementById('trainer_password').removeAttribute('required');

        document.getElementById('trainer_id').value = data.id;
        document.getElementById('trainer_name').value = data.full_name || data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim();
        document.getElementById('trainer_specialization').value = data.specialties || data.specialization || '';
        document.getElementById('trainer_phone').value = data.contact || data.phone || '';
    } else {
        // === CREATE ===
        currentTrainerId = null;
        title.textContent = 'Новий Тренер';
        deleteBtn.style.display = 'none';

        if (authFields) authFields.style.display = 'block';
        document.getElementById('trainer_username').setAttribute('required', 'true');
        document.getElementById('trainer_password').setAttribute('required', 'true');
    }

    if(window.openModal) window.openModal('trainerModal');
}

async function handleTrainerSubmit(e) {
    e.preventDefault();
    const form = e.target;

    const fullName = form.trainer_name.value.trim();
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    const payload = {
        first_name: firstName,
        last_name: lastName,
        specialties: form.trainer_specialization.value,
        contact: form.trainer_phone.value
    };

    if (currentTrainerId) {
        await sendDataRequest('PUT', `api/admin/instructors/${currentTrainerId}/`, payload, 'Дані тренера оновлено');
    } else {
        payload.username = form.trainer_username.value;
        payload.password = form.trainer_password.value;
        await sendDataRequest('POST', 'api/admin/instructors/', payload, 'Тренера створено');
    }
}

async function handleDeleteTrainer() {
    if (!currentTrainerId) return;
    await sendDataRequest('DELETE', `api/admin/instructors/${currentTrainerId}/`, null, 'Тренера видалено');
    if(window.closeModal) window.closeModal('confirmModal');
    if(window.closeModal) window.closeModal('trainerModal');
}


// ==========================================
// 3. ЛОГІКА РОЗКЛАДУ ТА ЗАГАЛЬНІ ФУНКЦІЇ
// ==========================================

async function loadDropdownOptions() {
    const token = getToken();

    try {
        const resTrainers = await fetch(`${BASE_URL}/api/admin/instructors/`, {
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
        console.error("Failed to load instructors for dropdown", e);
    }

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

// ==========================================
// 4. ІНІЦІАЛІЗАЦІЯ
// ==========================================

export function initAdminPage() {
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
        return;
    }

    console.log('Admin Page Initialized');

    // 1. Initial Load
    loadDropdownOptions();
    loadClientsTable();
    loadTrainersTable();

    // 2. Calendar Setup
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
            navLinks: true, editable: true, selectable: true,
            events: async function(info, successCallback, failureCallback) {
                const token = getToken();
                const url = `${BASE_URL.replace(/\/$/, '')}/api/admin/schedule/?start=${info.startStr}&end=${info.endStr}`;
                try {
                    const res = await fetch(url, { headers: { 'Authorization': `Token ${token}` } });
                    if (!res.ok) throw new Error('Failed to fetch events');
                    const events = await res.json();

                    successCallback(events.map(e => ({
                        id: e.id,
                        title: (e.class_name || `Class #${e.class_type}`) + (e.instructor_name ? ` (${e.instructor_name})` : ''),
                        start: e.start_at, end: e.end_at,
                        extendedProps: {
                            class_type: e.class_type, instructor: e.instructor,
                            capacity: e.capacity, class_name: e.class_name, instructor_name: e.instructor_name
                        },
                        backgroundColor: 'var(--primary)', borderColor: 'var(--primary)'
                    })));
                } catch (err) { failureCallback(err); }
            },
            eventClick: (info) => { info.jsEvent.preventDefault(); showEventModal(info.event); },
            dateClick: (info) => { showEventModal({ id: null, start: info.date, end: new Date(info.date.getTime()+3600000) }); },
            select: (info) => { showEventModal({ id: null, start: info.start, end: info.end }); }
        });
        currentCalendar.render();
    }

    // 3. EVENT HANDLERS

    const addEventBtn = document.getElementById('addEventBtn');
    if (addEventBtn) addEventBtn.addEventListener('click', () => showEventModal(null));

    const eventForm = document.getElementById('eventForm');
    if (eventForm) eventForm.addEventListener('submit', handleEventSubmit);

    const deleteEventBtn = document.getElementById('deleteEventBtn');
    if (deleteEventBtn) {
        deleteEventBtn.addEventListener('click', () => {
            const confirmBtn = document.getElementById('confirmActionBtn');
            if (confirmBtn) confirmBtn.onclick = handleDeleteEvent;
            if(window.openModal) window.openModal('confirmModal');
        });
    }

    const addClientBtn = document.getElementById('addClientBtn');
    if (addClientBtn) addClientBtn.addEventListener('click', () => showClientModal(null));

    const clientForm = document.getElementById('clientForm');
    if (clientForm) clientForm.addEventListener('submit', handleClientSubmit);

    const deleteClientBtn = document.getElementById('deleteClientBtn');
    if (deleteClientBtn) {
        deleteClientBtn.addEventListener('click', () => {
            const confirmBtn = document.getElementById('confirmActionBtn');
            if (confirmBtn) confirmBtn.onclick = handleDeleteClient;
            if(window.openModal) window.openModal('confirmModal');
        });
    }

    const addTrainerBtn = document.getElementById('addTrainerBtn');
    if (addTrainerBtn) addTrainerBtn.addEventListener('click', () => showTrainerModal(null));

    const trainerForm = document.getElementById('trainerForm');
    if (trainerForm) trainerForm.addEventListener('submit', handleTrainerSubmit);

    const deleteTrainerBtn = document.getElementById('deleteTrainerBtn');
    if (deleteTrainerBtn) {
        deleteTrainerBtn.addEventListener('click', () => {
            const confirmBtn = document.getElementById('confirmActionBtn');
            if (confirmBtn) confirmBtn.onclick = handleDeleteTrainer;
            if(window.openModal) window.openModal('confirmModal');
        });
    }
}