/* ===========================
    calendar.js — FullCalendar Integration
    =========================== */

import { BASE_URL, postAuthData } from './api.js';
import { showToast } from './ui.js';
import { getToken } from './auth.js';

// --- Logic: Booking (Запис на заняття) ---
async function handleBooking(eventId, eventTitle) {
    const token = getToken();

    // 1. Перевірка токена
    if (!token) {
        showToast('Сесія втрачена. Увійдіть знову.', 'error');
        return;
    }

    try {
        // 2. Відправка запиту
        await postAuthData('/api/book/', {
            session: eventId
        });

        // 3. Успіх
        showToast(`Ви успішно записані на: ${eventTitle}!`, 'success');

    } catch (error) {
        console.error('[Calendar] Booking Failed:', error);

        // 🛠 ВИПРАВЛЕННЯ:
        // Ми більше не гадаємо "можливо місць немає".
        // api.js вже дістав для нас точний текст помилки ("Ви вже записані...").
        // Просто показуємо його користувачу.

        // Видаляємо слово "Error: ", якщо воно є, для краси
        const cleanMessage = error.message.replace(/^Error:\s*/, '');

        showToast(cleanMessage, 'error');
    }
}

// --- Main Init Function ---
export function initCalendar() {
    const calendarEl = document.getElementById("calendar");
    if (!calendarEl) return;

    const eventSourceUrl = `${BASE_URL}/api/schedule/`;

    const calendar = new FullCalendar.Calendar(calendarEl, {
        locale: "uk",
        initialView: "timeGridWeek",
        allDaySlot: false,
        slotMinTime: "08:00:00",
        slotMaxTime: "21:00:00",
        height: 'auto',

        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek"
        },
        buttonText: {
            today: "Сьогодні", month: "Місяць", week: "Тиждень"
        },

        events: eventSourceUrl,

        eventDataTransform: function(apiEvent) {
            return {
                id: apiEvent.id,
                title: `${apiEvent.class_name} (${apiEvent.instructor_name || 'Зал'})`,
                start: apiEvent.start_at,
                end: apiEvent.end_at,
                backgroundColor: 'var(--accent)',
                borderColor: 'var(--accent)'
            };
        },

        eventClick(info) {
            info.jsEvent.preventDefault();
            const event = info.event;
            const token = getToken();

            if (!token) {
                showToast('Увійдіть, щоб записатися на тренування', 'error');
                if (window.openModal) window.openModal('loginModal');
                return;
            }

            const modalTitleEl = document.getElementById('bookingModalTitle');
            const modalBodyEl = document.getElementById('bookingModalBody');
            const confirmBtn = document.getElementById('confirmBookingButton');

            if (modalTitleEl && modalBodyEl && confirmBtn) {
                modalTitleEl.textContent = `Запис: ${event.title}`;

                const dateStr = event.start.toLocaleDateString('uk-UA');
                const timeStr = `${event.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${event.end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;

                modalBodyEl.innerHTML = `
                    <div style="text-align: center; font-size: 1.1em;">
                        <p><strong>📅 Дата:</strong> ${dateStr}</p>
                        <p><strong>⏰ Час:</strong> ${timeStr}</p>
                        <p style="margin-top: 10px; color: var(--muted);">Ви впевнені, що хочете записатися?</p>
                    </div>
                `;

                const newBtn = confirmBtn.cloneNode(true);
                confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

                newBtn.onclick = async () => {
                    if (window.closeModal) window.closeModal('bookingModal');
                    await handleBooking(event.id, event.title);
                };

                if (window.openModal) window.openModal('bookingModal');
            } else {
                console.error('Booking Modal elements missing');
            }
        }
    });

    calendar.render();
}