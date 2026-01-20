// src/components/Schedule.jsx
import { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ukLocale from '@fullcalendar/core/locales/uk'; // Українська мова
import { publicRequest, authRequest } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

export default function Schedule() {
    const { user } = useAuth();
    const { openLogin } = useUI();
    
    // Стан для модалки бронювання
    const [selectedEvent, setSelectedEvent] = useState(null);
    const calendarRef = useRef(null);

    // Функція завантаження подій (FullCalendar викликає її сам, коли гортаєш тижні)
    const fetchEvents = async (info, successCallback, failureCallback) => {
        try {
            // Передаємо start і end дати, щоб не вантажити весь рік одразу
            const url = `/api/schedule/?start=${info.startStr}&end=${info.endStr}`;
            const data = await publicRequest(url);
            
            // Перетворюємо дані бекенду у формат FullCalendar
            const events = data.map(item => ({
                id: item.id,
                title: item.class_name || 'Тренування',
                start: item.start_at,
                end: item.end_at,
                backgroundColor: 'var(--accent)', // Червоний колір
                borderColor: 'var(--accent)',
                // Зберігаємо додаткові дані (ім'я тренера, місця)
                extendedProps: {
                    instructor: item.instructor_name,
                    capacity: item.capacity,
                    booked: item.booked_count
                }
            }));
            
            successCallback(events);
        } catch (error) {
            console.error("Calendar Error:", error);
            failureCallback(error);
        }
    };

    // Клік на подію
    const handleEventClick = (info) => {
        // Зберігаємо дані клікнутого тренування і відкриваємо модалку
        setSelectedEvent({
            id: info.event.id,
            title: info.event.title,
            start: info.event.start,
            instructor: info.event.extendedProps.instructor,
            capacity: info.event.extendedProps.capacity,
            booked: info.event.extendedProps.booked
        });
    };

    // Логіка бронювання
    const handleBooking = async () => {
        if (!user) {
            openLogin(); // Якщо не зайшов - кидаємо на логін
            return;
        }

        if (!confirm(`Записатися на ${selectedEvent.title}?`)) return;

        try {
            await authRequest('/api/bookings/', 'POST', { 
                schedule: selectedEvent.id 
            });
            alert('Ви успішно записалися!');
            setSelectedEvent(null); // Закриваємо модалку
            
            // Оновлюємо календар (щоб змінилась кількість місць, якщо бек це віддає)
            if (calendarRef.current) {
                calendarRef.current.getApi().refetchEvents();
            }
        } catch (e) {
            alert('Помилка: ' + e.message);
        }
    };

    return (
        <section id="schedule" className="section container">
            <h2 className="section-title">Актуальний розклад занять</h2>
            
            {/* Обгортка для стилів (щоб календар був темним) */}
            <div className="calendar-wrapper" style={{background: '#1e1e1e', padding: '20px', borderRadius: '12px'}}>
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek'
                    }}
                    locale={ukLocale}
                    slotMinTime="08:00:00" // Початок робочого дня
                    slotMaxTime="22:00:00" // Кінець
                    allDaySlot={false}
                    events={fetchEvents} // <--- Магія тут
                    eventClick={handleEventClick}
                    height="auto"
                    aspectRatio={1.5}
                />
            </div>

            {/* --- МОДАЛКА БРОНЮВАННЯ (Вбудована) --- */}
            {selectedEvent && (
                <div className="modal-overlay" style={{
                    display: 'flex', zIndex: 10000, 
                    position:'fixed', top:0, left:0, width:'100%', height:'100%', 
                    background:'rgba(0,0,0,0.8)', alignItems:'center', justifyContent:'center'
                }}>
                    <div className="modal-content" style={{
                        background: '#1e1e1e', padding: '30px', borderRadius: '10px', 
                        width: '400px', position: 'relative', borderTop: '4px solid var(--accent)'
                    }}>
                        <button 
                            onClick={() => setSelectedEvent(null)}
                            style={{position:'absolute', top:'10px', right:'15px', background:'none', border:'none', color:'#fff', fontSize:'24px', cursor:'pointer'}}
                        >×</button>

                        <h3 style={{marginTop:0, color: 'var(--accent)'}}>{selectedEvent.title}</h3>
                        
                        <div style={{marginBottom: '20px', lineHeight: '1.6'}}>
                            <p><strong>🕒 Час:</strong> {selectedEvent.start.toLocaleString()}</p>
                            <p><strong>🏋️‍♂️ Тренер:</strong> {selectedEvent.instructor || 'Черговий'}</p>
                            {/* Якщо є дані про місця */}
                            {selectedEvent.capacity && (
                                <p><strong>👥 Місця:</strong> {selectedEvent.booked || 0} / {selectedEvent.capacity}</p>
                            )}
                        </div>

                        <div style={{display:'flex', gap:'10px', justifyContent:'flex-end'}}>
                            <button onClick={() => setSelectedEvent(null)} className="btn btn-ghost">Скасувати</button>
                            <button onClick={handleBooking} className="btn btn-primary">Записатися</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}