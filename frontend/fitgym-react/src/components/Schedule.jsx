// src/components/Schedule.jsx
import { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ukLocale from '@fullcalendar/core/locales/uk';
import { publicRequest, authRequest } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

export default function Schedule() {
    const { user } = useAuth();
    const { openLogin, addToast, confirmAction } = useUI();
    
    const [selectedEvent, setSelectedEvent] = useState(null);
    const calendarRef = useRef(null);

    const fetchEvents = async (info, successCallback, failureCallback) => {
        try {
            const url = `/api/schedule/?start=${info.startStr}&end=${info.endStr}`;
            const data = await publicRequest(url);
            
            const events = data.map(item => ({
                id: item.id,
                title: item.class_name || 'Тренування',
                start: item.start_at,
                end: item.end_at,
                backgroundColor: 'var(--accent)',
                borderColor: 'var(--accent)',
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

    const handleEventClick = (info) => {
        setSelectedEvent({
            id: info.event.id,
            title: info.event.title,
            start: info.event.start,
            instructor: info.event.extendedProps.instructor,
            capacity: info.event.extendedProps.capacity,
            booked: info.event.extendedProps.booked
        });
    };

    const handleBooking = () => {
        if (!user) {
            addToast('Спершу увійдіть у систему', 'error');
            openLogin();
            return;
        }

        confirmAction(
            `Записатися на заняття "${selectedEvent.title}"?`,
            async () => {
                try {
                    await authRequest('/api/book/', 'POST', { 
                        session: selectedEvent.id 
                    });
                    
                    addToast('Ви успішно записалися!', 'success');
                    setSelectedEvent(null);
                    
                    if (calendarRef.current) {
                        calendarRef.current.getApi().refetchEvents();
                    }
                } catch (e) {
                    addToast(e.message || 'Помилка бронювання', 'error');
                }
            }
        );
    };

    // Форматування дати для модалки
    const formatDate = (date) => {
        if (!date) return '';
        return new Intl.DateTimeFormat('uk-UA', {
            day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
        }).format(date);
    };

    return (
        <section id="schedule" className="section container">
            <h2 className="section-title">Актуальний розклад занять</h2>
            
            <div className="calendar-wrapper">
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
                    slotMinTime="08:00:00"
                    slotMaxTime="22:00:00"
                    allDaySlot={false}
                    slotLabelFormat={{
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    }}
                    eventTimeFormat={{
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    }}
                    events={fetchEvents}
                    eventClick={handleEventClick}
                    height="auto"
                    aspectRatio={1.5}
                />
            </div>

            {/* Вбудована модалка для деталей події */}
            {selectedEvent && (
                <div className="modal-overlay active">
                    <div className="modal-content booking-modal">
                        <button className="modal-close" onClick={() => setSelectedEvent(null)}>×</button>

                        <h3 className="modal-title">{selectedEvent.title}</h3>
                        
                        <div className="booking-details">
                            <p>
                                <i className="far fa-clock"></i> 
                                <strong>Час:</strong> {formatDate(selectedEvent.start)}
                            </p>
                            <p>
                                <i className="fas fa-user-tie"></i>
                                <strong>Тренер:</strong> {selectedEvent.instructor || 'Черговий'}
                            </p>
                            {selectedEvent.capacity && (
                                <p>
                                    <i className="fas fa-users"></i>
                                    <strong>Місця:</strong> {selectedEvent.booked || 0} / {selectedEvent.capacity}
                                </p>
                            )}
                        </div>

                        <div className="booking-footer">
                            <button onClick={() => setSelectedEvent(null)} className="btn btn-ghost">Скасувати</button>
                            <button onClick={handleBooking} className="btn btn-primary">Записатися</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}