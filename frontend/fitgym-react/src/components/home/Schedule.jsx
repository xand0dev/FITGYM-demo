import { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ukLocale from '@fullcalendar/core/locales/uk';
import { publicRequest } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

// Підключаємо наш арсенал React Query
import { useQueryClient } from '@tanstack/react-query';
import { useFitMutation } from '../../hooks/useFitQuery';

export default function Schedule() {
    const { user } = useAuth();
    const { openLogin, addToast, confirmAction } = useUI();
    
    const [selectedEvent, setSelectedEvent] = useState(null);
    const calendarRef = useRef(null);
    
    // Отримуємо доступ до головного когітатора кешу
    const queryClient = useQueryClient();
    
    // Заряджаємо мутацію для бронювання
    const bookMutation = useFitMutation('POST');

    // Календар викликає цю функцію при зміні дат
    const fetchEvents = async (info, successCallback, failureCallback) => {
        try {
            // Замість прямого запиту, пропускаємо його через матрицю кешування
            const data = await queryClient.fetchQuery({
                queryKey: ['schedule', info.startStr, info.endStr],
                queryFn: () => publicRequest(`/api/schedule/?start=${info.startStr}&end=${info.endStr}`),
                staleTime: 1000 * 60 * 5, // 5 хвилин дані вважаються свіжими
            });
            
            const events = data.map(item => ({
                id: item.id,
                title: item.class_name || 'Тренування',
                start: item.start_at,
                end: item.end_at,
                backgroundColor: '#ff0000',
                borderColor: '#cc0000',
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

        // Використовуємо confirmAction для модалки "Я ВПЕВНЕНИЙ"
        confirmAction(
            `Записатися на заняття "${selectedEvent.title}"?`,
            () => {
                // Виконуємо тактичний удар через мутацію
                bookMutation.mutate(
                    { endpoint: '/api/book/', data: { session: selectedEvent.id } },
                    {
                        onSuccess: () => {
                            addToast('Ви успішно записалися!', 'success');
                            setSelectedEvent(null);
                            
                            // Примусово оновлюємо події в календарі після успішного запису
                            if (calendarRef.current) {
                                calendarRef.current.getApi().refetchEvents();
                            }
                        },
                        onError: (error) => {
                            addToast(error.message || 'Помилка бронювання', 'error');
                        }
                    }
                );
            }
        );
    };

    const formatDate = (date) => {
        if (!date) return '';
        return new Intl.DateTimeFormat('uk-UA', {
            day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
        }).format(date);
    };

    const isFull = selectedEvent?.booked >= selectedEvent?.capacity;
    // Блокуємо кнопку, якщо місць немає або якщо зараз іде запит на сервер
    const isActionDisabled = isFull || bookMutation.isPending;

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
                    slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
                    eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
                    events={fetchEvents}
                    eventClick={handleEventClick}
                    height="auto"
                />
            </div>

            {selectedEvent && (
                <div className="modal-overlay active" onClick={() => !bookMutation.isPending && setSelectedEvent(null)}>
                    <div className="modal-content booking-modal" onClick={e => e.stopPropagation()}>
                        <button 
                            className="modal-close" 
                            onClick={() => setSelectedEvent(null)}
                            disabled={bookMutation.isPending}
                        >×</button>

                        <h3 className="modal-title">{selectedEvent.title}</h3>
                        <div className="modal-divider"></div>
                        
                        <div className="booking-details">
                            <div className="detail-item">
                                <i className="far fa-clock"></i> 
                                <div>
                                    <span className="label">Час:</span>
                                    <span className="value">{formatDate(selectedEvent.start)}</span>
                                </div>
                            </div>
                            <div className="detail-item">
                                <i className="fas fa-user-tie"></i>
                                <div>
                                    <span className="label">Тренер:</span>
                                    <span className="value">{selectedEvent.instructor || 'Поліна Товстуха'}</span>
                                </div>
                            </div>
                            <div className="detail-item">
                                <i className="fas fa-users"></i>
                                <div>
                                    <span className="label">Місця:</span>
                                    <span className={`value ${isFull ? 'text-danger' : ''}`}>
                                        {selectedEvent.booked || 0} / {selectedEvent.capacity}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="booking-footer">
                            <button 
                                onClick={() => setSelectedEvent(null)} 
                                className="btn-cancel"
                                disabled={bookMutation.isPending}
                            >
                                СКАСУВАТИ
                            </button>
                            <button 
                                onClick={handleBooking} 
                                className="btn-confirm" 
                                disabled={isActionDisabled}
                            >
                                {bookMutation.isPending ? 'ОБРОБКА...' : (isFull ? 'МІСЦЬ НЕМАЄ' : 'ЗАПИСАТИСЯ')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}