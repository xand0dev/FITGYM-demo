/* ===========================
    calendar.js — Логіка FullCalendar
    =========================== */

import { BASE_URL } from './api.js';
import { showToast, escapeHtml } from './ui.js';
import { getToken } from './auth.js';


// 💡 Викликаємо showModal/closeModal з window, оскільки вони прив'язані до глобальної області видимості
// @ts-ignore
const openModal = window.showModal; 
// @ts-ignore
const hideModal = window.closeModal; 


// Функція для обробки запису (приклад AJAX-запиту)
async function handleBooking(eventId, eventTitle) {
    const token = getToken();
    const url = `${BASE_URL}/api/bookings/`; 

    if (!token) {
        showToast('Помилка автентифікації. Увійдіть знову.', 'error');
        return;
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                schedule_id: eventId 
            })
        });

        if (response.ok) {
            showToast(`Успішний запис на: ${eventTitle}!`, 'success');
        } else {
            const errorData = await response.json();
            showToast(`Помилка запису: ${errorData.detail || 'Невідома помилка'}`, 'error');
        }
    } catch (error) {
        showToast('Помилка мережі. Не вдалося зв\'язатися з сервером.', 'error');
        console.error('Booking error:', error);
    }
}


export function initCalendar() {
    const calendarEl = document.getElementById("calendar");
    if (!calendarEl) return;

    const eventSourceUrl = `${BASE_URL}/api/schedule/`;

    const calendar = new FullCalendar.Calendar(calendarEl, {
        // ... (Налаштування календаря)
        locale: "uk",
        initialView: "timeGridWeek",
        allDaySlot: false,
        slotMinTime: "08:00:00",
        slotMaxTime: "21:00:00",
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
        // ... (Кінець налаштувань календаря)

        events: eventSourceUrl,

        eventDataTransform: function(apiEvent) {
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
            
            const dateStr = eventStart.toLocaleDateString('uk-UA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            const timeStr = eventStart.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }) 
                             + ' – ' + eventEnd.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });

            const token = getToken();
            if (!token) {
                showToast('Будь ласка, увійдіть, щоб записатися на заняття', 'error');
                if(openModal) openModal('loginModal'); 
                return;
            }

            // --- 🚀 ЛОГІКА ПОКАЗУ МОДАЛЬНОГО ВІКНА ЗАПИСУ 🚀 ---
            
            const modalTitleEl = document.getElementById('bookingModalTitle');
            const modalBodyEl = document.getElementById('bookingModalBody');
            const confirmBtn = document.getElementById('confirmBookingButton');
            const bookingModalEl = document.getElementById('bookingModal'); 

            if (modalTitleEl && modalBodyEl && confirmBtn && bookingModalEl && openModal) {
                
                // 1. Заповнюємо контент
                modalTitleEl.textContent = `Запис на: ${escapeHtml(eventTitle)}`; 
                modalBodyEl.innerHTML = `
                    <p><strong>${escapeHtml(eventTitle)}</strong></p>
                    <p>🗓️ <b>Дата:</b> ${dateStr}</p>
                    <p>⏰ <b>Час:</b> ${timeStr}</p>
                    <p>Ви впевнені, що хочете забронювати місце?</p>
                `;
                
                // 2. Навішуємо обробник події на кнопку "Записатися"
                confirmBtn.onclick = async () => {
                    if(hideModal) hideModal('bookingModal'); 
                    await handleBooking(eventId, eventTitle);
                };

                // 3. Відкриваємо модалку за допомогою вашої системи
                openModal('bookingModal');

            } else {
                showToast('Помилка: Не знайдено елементів модального вікна запису.', 'error');
            }
        }
    });

    calendar.render();
}