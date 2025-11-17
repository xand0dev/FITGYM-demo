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

        // --- 🌟 ЗМІНИ ТУТ 🌟 ---
        initialView: "timeGridWeek", // <--- 1. ОСНОВНА ЗМІНА
        allDaySlot: false,           // <--- 2. Прибираємо слот "весь день"
        slotMinTime: "08:00:00",     // <--- 3. Починаємо о 8:00
        slotMaxTime: "21:00:00",     // <--- 4. Закінчуємо о 21:00
        // --- 🌟 КІНЕЦЬ ЗМІН 🌟 ---

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
                // @ts-ignore
                if (calendar.getEvents().length === 0) {
                    showToast('Не вдалося завантажити розклад з API.', 'error');
                }
            }
        },

        eventClick(info) {
            info.jsEvent.preventDefault();

            const event = info.event;
            const eventId = event.id;
            const eventTitle = event.title;
            const eventStart = event.start;
            const eventEnd = event.end;
            
            // Форматуємо дату та час для модального вікна
            const dateStr = eventStart.toLocaleDateString('uk-UA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            const timeStr = eventStart.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }) 
                          + ' – ' + eventEnd.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });

            const token = getToken();
            if (!token) {
                showToast('Будь ласка, увійдіть, щоб записатися на заняття', 'error');
                // Викликаємо модалку логіну
                showModal('loginModal'); 
                return;
            }

            // --- 🚀 ЛОГІКА ПОКАЗУ МОДАЛЬНОГО ВІКНА ЗАПИСУ 🚀 ---
            
            // 1. Заповнюємо дані у модальному вікні (припускаємо, що у вас є відповідні HTML-елементи)
            const modalTitleEl = document.getElementById('bookingModalTitle'); // Заголовок модалки
            const modalBodyEl = document.getElementById('bookingModalBody');   // Тіло модалки
            const confirmBtn = document.getElementById('confirmBookingButton'); // Кнопка підтвердження

            if (modalTitleEl && modalBodyEl && confirmBtn) {
                // Використовуємо escapeHtml для безпеки
                modalTitleEl.innerHTML = `Записатися на заняття?`; 
                modalBodyEl.innerHTML = `
                    <p><strong>${escapeHtml(eventTitle)}</strong></p>
                    <p>🗓️ **Дата:** ${dateStr}</p>
                    <p>⏰ **Час:** ${timeStr}</p>
                    <p>Ви впевнені, що хочете забронювати місце?</p>
                `;

                // 2. Зберігаємо ID події у кнопці, щоб потім його використати
                confirmBtn.setAttribute('data-event-id', eventId); 
                confirmBtn.setAttribute('data-event-title', eventTitle);

                // 3. Викликаємо модальне вікно запису
                showModal('bookingModal'); // Припускаємо, що ID вашого модального вікна — 'bookingModal'

            } else {
                showToast('Помилка: Не знайдено елементів модального вікна запису.', 'error');
            }
            // ---------------------------------------------------
        }
    });

    calendar.render();
}

           