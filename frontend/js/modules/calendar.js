/* ===========================
    calendar.js — FullCalendar Integration
    ---------------------------
    Відповідає за: Відображення розкладу, Клік по події,
    Бронювання тренування (Booking).
    =========================== */

import { BASE_URL } from './api.js';
import { showToast, escapeHtml } from './ui.js';
import { getToken } from './auth.js';

// --- Logic: Booking (Запис на заняття) ---
async function handleBooking(eventId, eventTitle) {
    const token = getToken();

    if (!token) {
        showToast('Сесія втрачена. Увійдіть знову.', 'error');
        return;
    }

    const url = `${BASE_URL}/api/bookings/`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ schedule_id: eventId })
        });

        if (response.ok) {
            showToast(`Ви успішно записані на: ${eventTitle}`, 'success');
        } else {
            const errorData = await response.json();
            // Обробка помилки (наприклад, "Вже записані" або "Немає місць")
            showToast(`Помилка: ${errorData.detail || 'Не вдалося записатися'}`, 'error');
        }
    } catch (error) {
        console.error('[Calendar] Booking Failed:', error);
        showToast('Помилка з\'єднання з сервером', 'error');
    }
}

// --- Main Init Function ---
export function initCalendar() {
    const calendarEl = document.getElementById("calendar");
    if (!calendarEl) return; // Якщо на сторінці немає календаря, виходимо

    const eventSourceUrl = `${BASE_URL}/api/schedule/`;

    // Ініціалізація FullCalendar
    const calendar = new FullCalendar.Calendar(calendarEl, {
        locale: "uk",
        initialView: "timeGridWeek",
        allDaySlot: false,
        slotMinTime: "08:00:00",
        slotMaxTime: "21:00:00",
        height: 'auto', // Адаптивна висота

        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek"
        },
        buttonText: {
            today: "Сьогодні",
            month: "Місяць",
            week: "Тиждень"
        },

        // Джерело подій (GET запит робить сама бібліотека)
        events: eventSourceUrl,

        // Трансформація даних з API у формат FullCalendar
        eventDataTransform: function(apiEvent) {
            return {
                id: apiEvent.id,
                title: `${apiEvent.class_name} (${apiEvent.instructor_name || 'Зал'})`,
                start: apiEvent.start_at,
                end: apiEvent.end_at,
                backgroundColor: 'var(--accent)', // Стилізація під наш дизайн
                borderColor: 'var(--accent)'
            };
        },

        // Обробка кліку по події
        eventClick(info) {
            info.jsEvent.preventDefault(); // Зупиняємо перехід за посиланням, якщо є

            const event = info.event;
            const token = getToken();

            // 1. Якщо не залогінений -> Відкриваємо логін
            if (!token) {
                showToast('Увійдіть, щоб записатися на тренування', 'error');
                if (window.openModal) window.openModal('loginModal');
                return;
            }

            // 2. Якщо залогінений -> Відкриваємо модалку підтвердження
            const modalTitleEl = document.getElementById('bookingModalTitle');
            const modalBodyEl = document.getElementById('bookingModalBody');
            const confirmBtn = document.getElementById('confirmBookingButton');

            // Перевіряємо наявність елементів модалки в DOM
            if (modalTitleEl && modalBodyEl && confirmBtn) {
                // Заповнюємо даними
                modalTitleEl.textContent = `Запис: ${event.title}`;

                const dateStr = event.start.toLocaleDateString('uk-UA');
                const timeStr = `${event.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${event.end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;

                modalBodyEl.innerHTML = `
                    <div style="text-align: center; font-size: 1.1em;">
                        <p><strong>📅 Дата:</strong> ${dateStr}</p>
                        <p><strong>⏰ Час:</strong> ${timeStr}</p>
                        <p style="margin-top: 10px; color: var(--muted);">Підтвердіть бронювання місця.</p>
                    </div>
                `;

                // Перестворюємо кнопку (cloneNode), щоб зняти попередні onclick і не записати 10 разів
                const newBtn = confirmBtn.cloneNode(true);
                confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

                // Вішаємо нову подію
                newBtn.onclick = async () => {
                    if (window.closeModal) window.closeModal('bookingModal');
                    await handleBooking(event.id, event.title);
                };

                // Відкриваємо
                if (window.openModal) window.openModal('bookingModal');

            } else {
                console.error('[Calendar] Booking Modal elements not found in HTML.');
            }
        }
    });

    calendar.render();
}