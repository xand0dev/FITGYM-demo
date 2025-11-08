/* ===========================
   calendar.js — Логіка FullCalendar
   =========================== */

import { BASE_URL } from './api.js';
import { showToast, showModal, escapeHtml } from './ui.js';
import { getToken } from './auth.js';

export function initCalendar() {
    const calendarEl = document.getElementById("calendar");
    if (!calendarEl) return;

    const eventSourceUrl = `${BASE_URL}/api/schedule/`;

    const calendar = new FullCalendar.Calendar(calendarEl, {
        locale: "uk",
        initialView: "dayGridMonth",
        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay"
        },
        buttonText: {
            today: "Сьогодні",
            month: "Місяць",
            week: "Тиждень",
            day: "День"
        },

        events: eventSourceUrl,

        eventDataTransform: function(apiEvent) {
            // Конвертуємо дані з API у формат FullCalendar
            return {
                id: apiEvent.id,
                title: `${apiEvent.class_name} (${apiEvent.instructor_name || 'Зал'})`,
                start: apiEvent.start_at,
                end: apiEvent.end_at,
                extendedProps: {
                    capacity: apiEvent.capacity
                }
            };
        },

        loading: function(isLoading) {
            // Обробка помилки (якщо бекенд вимкнено)
            if (!isLoading) {
                if (calendar.getEvents().length === 0) {
                    showToast('Не вдалося завантажити розклад з API.', 'error');
                }
            }
        },

        eventClick(info) {
            // (Етап 4)
            info.jsEvent.preventDefault();

            const eventId = info.event.id;
            const eventTitle = info.event.title;

            console.log(`Клікнули на заняття з ID: ${eventId} (${eventTitle})`);

            const token = getToken();
            if (!token) {
                showToast('Будь ласка, увійдіть, щоб записатися на заняття', 'error');
                showModal('loginModal');
                return;
            }

            // TODO: (Етап 4) Викликати модальне вікно "Записатися?"
            showToast(`Ви обрали: ${escapeHtml(eventTitle)}. Скоро тут буде запис!`, 'success');
        }
    });

    calendar.render();
}