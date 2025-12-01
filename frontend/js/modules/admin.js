/* ===========================
    admin.js — Логіка Адмін-панелі для Тренера
    =========================== */

import { BASE_URL } from './api.js';
import { showToast, escapeHtml } from './ui.js';
import { getToken } from './auth.js';
import { initCalendar } from './calendar.js'; // Імпорт оновленого календаря


let currentEventId = null; 
let currentCalendar = null; // Зберігатиме екземпляр FullCalendar

// --- ДОПОМІЖНІ ФУНКЦІЇ UI ---

/**
 * Відображає помилки валідації під полями форми.
 * @param {string} fieldId - ID поля, де виникла помилка.
 * @param {string | null} message - Повідомлення про помилку або null, щоб приховати.
 */
function displayFormError(fieldId, message) {
    const field = document.getElementById(fieldId);
    let errorEl = field.nextElementSibling;

    // Створюємо елемент для помилки, якщо його немає
    if (!errorEl || !errorEl.classList.contains('error-message')) {
        errorEl = document.createElement('div');
        errorEl.classList.add('error-message');
        field.parentNode.insertBefore(errorEl, field.nextSibling);
    }

    if (message) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    } else {
        errorEl.textContent = '';
        errorEl.style.display = 'none';
    }
}

/**
 * Оновлює форму для режиму редагування або додавання
 * @param {object | null} eventData - Дані події або null для режиму додавання
 */
function showEventForm(eventData = null) {
    const formContainer = document.getElementById('eventFormContainer');
    const form = document.getElementById('eventForm');
    const title = formContainer.querySelector('h3');
    const saveBtn = document.getElementById('saveEventBtn');
    const deleteBtn = document.getElementById('deleteEventBtn');
    const addEventBtn = document.getElementById('addEventBtn');
    const clearFormBtn = document.getElementById('clearFormBtn');

    // Приховати всі попередні помилки
    document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');

    formContainer.style.display = 'block';
    addEventBtn.style.display = 'none';
    clearFormBtn.style.display = 'block'; // Показати кнопку очищення

    if (eventData) {
        // Режим редагування
        currentEventId = eventData.id;
        title.textContent = 'Редагувати Заняття';
        saveBtn.textContent = 'Зберегти Зміни';
        deleteBtn.style.display = 'block';
        
        // Заповнення полів
        document.getElementById('event_id').value = eventData.id;
        document.getElementById('class_name').value = eventData.extendedProps.class_name || eventData.title.split('(')[0].trim();
        document.getElementById('instructor_name').value = eventData.extendedProps.instructor_name || eventData.title.match(/\(([^)]+)\)$/)?.[1] || '';
        document.getElementById('capacity').value = eventData.extendedProps.capacity || '';
        // Використовуємо формат Date для перетворення UTC на локальний час
        document.getElementById('start_at').value = formatDateTimeLocal(eventData.start);
        document.getElementById('end_at').value = formatDateTimeLocal(eventData.end);

    } else {
        // Режим додавання
        currentEventId = null;
        title.textContent = 'Додати Нове Заняття';
        saveBtn.textContent = 'Додати';
        deleteBtn.style.display = 'none';
        form.reset();
    }
}

/**
 * Приховує форму та очищає стан
 */
function hideEventForm() {
    document.getElementById('eventFormContainer').style.display = 'none';
    document.getElementById('addEventBtn').style.display = 'block';
    document.getElementById('eventForm').reset();
    currentEventId = null;
    document.getElementById('bookingList').innerHTML = '<p class="muted">Оберіть подію у календарі, щоб побачити список.</p>';
}

/**
 * Форматує об'єкт Date у рядок, придатний для input type="datetime-local"
 * Увага: FullCalendar повертає об'єкти Date, які мають бути перетворені у локальний формат.
 * @param {Date | string | null} date - Об'єкт дати або рядок ISO
 * @returns {string} Рядок у форматі YYYY-MM-DDTHH:MM
 */
function formatDateTimeLocal(date) {
    if (!date) return '';
    const dt = new Date(date);
    
    // Переконаємося, що ми використовуємо локальний час для відображення
    const offset = dt.getTimezoneOffset() * 60000; // різниця в мс
    const localTime = new Date(dt.getTime() - offset);
    
    return localTime.toISOString().slice(0, 16);
}


// --- ЛОГІКА API ---

/**
 * Надсилає запит на додавання, редагування або видалення події.
 * @param {string} method - 'POST', 'PUT' або 'DELETE'
 * @param {object} data - Дані події (або null для DELETE)
 * @param {string | null} eventId - ID події для PUT/DELETE
 */
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
            showToast(`Подію успішно ${method === 'DELETE' ? 'видалено' : 'збережено'}!`, 'success');
            // Оновлюємо календар
            currentCalendar.refetchEvents();
            hideEventForm();
        } else {
            const error = await response.json();
            // Покращена обробка помилок
            if (error.detail && typeof error.detail === 'string') {
                showToast(`Помилка API: ${error.detail}`, 'error');
            } else {
                 showToast(`Помилка API: ${response.statusText}`, 'error');
            }
            console.error('API Error:', error);
        }
    } catch (error) {
        showToast('Помилка мережі при роботі з розкладом.', 'error');
        console.error('Network Error:', error);
    }
}


/**
 * Отримує та відображає список записаних клієнтів
 * @param {string} eventId - ID події
 */
export async function fetchBookings(eventId) {
    const token = getToken();
    const listEl = document.getElementById('bookingList');
    listEl.innerHTML = '<p class="muted">Завантаження...</p>';

    try {
        const response = await fetch(`${BASE_URL}/api/schedule/${eventId}/bookings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const bookings = await response.json();
            if (bookings.length === 0) {
                listEl.innerHTML = '<p class="muted">На це заняття ще ніхто не записався.</p>';
                return;
            }

            let html = '<ul>';
            bookings.forEach(b => {
                html += `<li><i class="fas fa-user-check"></i> ${escapeHtml(b.user_name)} (${escapeHtml(b.user_email)})</li>`;
            });
            html += '</ul>';
            listEl.innerHTML = html;
        } else {
            listEl.innerHTML = '<p class="muted">Помилка завантаження списку записів.</p>';
            showToast('Не вдалося завантажити записи.', 'error');
        }
    } catch (error) {
        listEl.innerHTML = '<p class="muted">Помилка мережі.</p>';
        console.error('Fetch Bookings Error:', error);
    }
}


// --- ІНІЦІАЛІЗАЦІЯ ---

/**
 * Ініціалізує адмін-панель (календар та форми)
 */
export function initAdminPage() {
    // 1. Ініціалізація календаря в режимі адміна
    const calendarEl = document.getElementById('calendar');
    currentCalendar = initCalendar(calendarEl, true); // Передаємо true для режиму адміна

    // 2. Налаштування обробників форм
    document.getElementById('addEventBtn').addEventListener('click', () => showEventForm(null));
    document.getElementById('cancelEditBtn').addEventListener('click', hideEventForm);
    document.getElementById('deleteEventBtn').addEventListener('click', () => handleDeleteEvent(currentEventId));
    document.getElementById('clearFormBtn').addEventListener('click', hideEventForm); // Нова кнопка очищення

    document.getElementById('eventForm').addEventListener('submit', handleFormSubmit);

    // 3. Налаштування кнопки виходу ( Logout )
    document.getElementById('adminLogoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        // Припускаємо, що logout обробляється в auth.js або index.html
        localStorage.removeItem('fp_token');
        localStorage.removeItem('fp_user_name');
        window.location.href = 'index.html';
    });

    // 4. Перевірка автентифікації тренера (мінімальна)
    if (!getToken()) {
        showToast('Увійдіть як тренер для доступу до адмін-панелі.', 'error');
        // Перенаправлення, якщо немає токена
        // window.location.href = 'index.html';
        return;
    }

    showToast('Панель тренера успішно завантажена.', 'success');
}


// --- ОСНОВНІ ОБРОБНИКИ ДІЙ ---

/**
 * Обробник форми додавання/редагування події
 * @param {Event} e 
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    
    // Очистити попередні помилки
    document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');

    // 1. Валідація на стороні клієнта
    const startInput = form.start_at.value;
    const endInput = form.end_at.value;
    
    if (!startInput) {
        displayFormError('start_at', 'Вкажіть час початку.');
        return;
    }
    if (!endInput) {
        displayFormError('end_at', 'Вкажіть час завершення.');
        return;
    }
    
    const start = new Date(startInput);
    const end = new Date(endInput);

    if (start >= end) {
        displayFormError('end_at', 'Час завершення має бути пізнішим за час початку.');
        return;
    }
    
    // 2. Перетворення на ISO (UTC) для API
    const data = {
        class_name: form.class_name.value,
        instructor_name: form.instructor_name.value,
        capacity: parseInt(form.capacity.value, 10),
        // Перетворення локального часу (input) на UTC (ISO string)
        start_at: start.toISOString(), 
        end_at: end.toISOString(),
    };

    if (currentEventId) {
        // Режим редагування
        await sendEventRequest('PUT', data, currentEventId);
    } else {
        // Режим додавання
        await sendEventRequest('POST', data, null);
    }
}

/**
 * Обробник видалення події
 * @param {string | null} eventId 
 */
function handleDeleteEvent(eventId) {
    if (!eventId) {
        showToast('Помилка: Не обрано подію для видалення.', 'error');
        return;
    }

    // Використовуємо модальне вікно підтвердження (якщо воно є)
    const confirmModalEl = document.getElementById('confirmModal');
    // Використовуємо window.openModal/window.closeModal, оскільки вони були прив'язані в ui.js
    if (confirmModalEl && window.openModal && window.closeModal) { 
        document.getElementById('confirmModalTitle').textContent = 'Підтвердіть видалення';
        document.getElementById('confirmModalBody').textContent = 'Ви впевнені, що хочете видалити це заняття? Це призведе до скасування записів усіх клієнтів.';
        
        const confirmActionBtn = document.getElementById('confirmActionBtn');
        
        // Клонуємо кнопку для видалення попередніх слухачів
        const newConfirmActionBtn = confirmActionBtn.cloneNode(true);
        confirmActionBtn.parentNode.replaceChild(newConfirmActionBtn, confirmActionBtn);

        // Додаємо новий слухач
        newConfirmActionBtn.addEventListener('click', async () => {
            window.closeModal('confirmModal');
            await sendEventRequest('DELETE', null, eventId);
        }, { once: true });

        window.openModal('confirmModal');

    } else {
        // Якщо модалки немає, використовуємо простий confirm (для тестування)
        if (confirm(`Ви впевнені, що хочете видалити подію ${currentEventId}?`)) {
            sendEventRequest('DELETE', null, eventId);
        }
    }
}