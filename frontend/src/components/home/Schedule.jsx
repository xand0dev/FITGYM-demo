import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
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
    const isActionDisabled = isFull || bookMutation.isPending;

    return (
        <section id="schedule" className="py-24 bg-background">
            <div className="container mx-auto max-w-[1200px] px-5 lg:px-8">
                <div className="text-center mb-12">
                    <span className="font-heading text-primary text-xs uppercase tracking-[4px]">Розклад</span>
                    <h2 className="font-display text-[clamp(2.5rem,6vw,4rem)] text-white uppercase tracking-wide mt-2">
                        Актуальний <span className="text-gradient-red">Розклад</span>
                    </h2>
                </div>
                
                <div className="rounded-card p-5 md:p-[30px] border border-white/[0.06] bg-white/[0.02] overflow-hidden">
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
            </div>

            {/* ПРЕМІУМ МОДАЛКА БРОНЮВАННЯ */}
            {selectedEvent && createPortal(
                <div className="fixed inset-0 w-screen h-screen bg-black/80 backdrop-blur-md z-[100000] flex items-center justify-center p-4 animate-fadeIn" onClick={() => !bookMutation.isPending && setSelectedEvent(null)}>
                    <div className="bg-[#141414] border border-[#333] border-t-4 border-t-primary rounded-2xl p-[35px] max-w-[420px] w-full shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative overflow-hidden animate-popIn" onClick={e => e.stopPropagation()}>
                        
                        <button 
                            className="absolute top-[20px] right-[20px] w-[30px] h-[30px] flex items-center justify-center rounded-full text-[#555] text-2xl hover:text-white hover:bg-white/10 transition-colors duration-300 disabled:opacity-50" 
                            onClick={() => setSelectedEvent(null)}
                            disabled={bookMutation.isPending}
                        >
                            &times;
                        </button>

                        <h3 className="mt-0 text-white text-[1.6rem] md:text-[1.8rem] font-extrabold text-center uppercase tracking-[1px] mb-[30px] pb-[20px] border-b border-white/10 relative">
                            {selectedEvent.title}
                            <span className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-[60px] h-[3px] bg-primary shadow-[0_0_10px_#ff0000]"></span>
                        </h3>
                        
                        <div className="flex flex-col gap-3">
                            <div className="bg-white/5 p-3 px-4 rounded-lg flex items-center gap-4 text-[1.05rem] text-[#ddd] border border-transparent transition-all duration-300 hover:bg-white/10 hover:border-white/10">
                                <i className="far fa-clock text-primary text-[1.2rem] w-6 text-center drop-shadow-[0_0_5px_rgba(230,0,0,0.4)]"></i> 
                                <div>
                                    <span className="text-white font-semibold mr-2">Час:</span>
                                    <span>{formatDate(selectedEvent.start)}</span>
                                </div>
                            </div>
                            <div className="bg-white/5 p-3 px-4 rounded-lg flex items-center gap-4 text-[1.05rem] text-[#ddd] border border-transparent transition-all duration-300 hover:bg-white/10 hover:border-white/10">
                                <i className="fas fa-user-tie text-primary text-[1.2rem] w-6 text-center drop-shadow-[0_0_5px_rgba(230,0,0,0.4)]"></i>
                                <div>
                                    <span className="text-white font-semibold mr-2">Тренер:</span>
                                    <span>{selectedEvent.instructor || 'Поліна Товстуха'}</span>
                                </div>
                            </div>
                            <div className="bg-white/5 p-3 px-4 rounded-lg flex items-center gap-4 text-[1.05rem] text-[#ddd] border border-transparent transition-all duration-300 hover:bg-white/10 hover:border-white/10">
                                <i className="fas fa-users text-primary text-[1.2rem] w-6 text-center drop-shadow-[0_0_5px_rgba(230,0,0,0.4)]"></i>
                                <div>
                                    <span className="text-white font-semibold mr-2">Місця:</span>
                                    <span className={`font-bold ${isFull ? 'text-primary' : 'text-[#ddd]'}`}>
                                        {selectedEvent.booked || 0} / {selectedEvent.capacity}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-[30px] pt-0 grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-4">
                            <button 
                                onClick={() => setSelectedEvent(null)} 
                                className="w-full border border-[#444] text-[#aaa] rounded-lg py-[14px] text-[0.9rem] font-bold uppercase tracking-wide transition-colors duration-300 hover:border-white hover:text-white hover:bg-white/5 disabled:opacity-50"
                                disabled={bookMutation.isPending}
                            >
                                СКАСУВАТИ
                            </button>
                            <button 
                                onClick={handleBooking} 
                                className="w-full bg-primary text-white rounded-lg py-[14px] text-[0.95rem] font-extrabold uppercase tracking-wide shadow-[0_5px_20px_rgba(230,0,0,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(230,0,0,0.5)] disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed" 
                                disabled={isActionDisabled}
                            >
                                {bookMutation.isPending ? 'ОБРОБКА...' : (isFull ? 'МІСЦЬ НЕМАЄ' : 'ЗАПИСАТИСЯ')}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Стилі для кастомізації FullCalendar та анімацій модалки */}
            <style>{`
                /* Animations */
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.3s ease forwards; }
                @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-popIn { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }

                /* ===== FULLCALENDAR COMPLETE DARK THEME ===== */

                /* Global background kill — every cell, header, row */
                .fc,
                .fc-theme-standard,
                .fc-theme-standard td,
                .fc-theme-standard th,
                .fc-theme-standard .fc-scrollgrid,
                .fc-scrollgrid-section,
                .fc-scrollgrid-section > *,
                .fc-scrollgrid-sync-table,
                .fc-col-header,
                .fc-col-header-cell,
                .fc-timegrid-col,
                .fc-timegrid-slot,
                .fc-timegrid-slot-lane,
                .fc-timegrid-slot-label,
                .fc-timegrid-body,
                .fc-timegrid-cols,
                .fc-timegrid-axis,
                .fc-timegrid-axis-frame,
                .fc-timegrid-divider,
                .fc-timegrid-now-indicator-container,
                .fc-daygrid-body,
                .fc-daygrid-day,
                .fc-daygrid-day-frame,
                .fc-daygrid-day-top,
                .fc-daygrid-day-events,
                .fc-daygrid-event-harness,
                .fc-daygrid-day-bg,
                .fc-scrollgrid-sync-inner,
                .fc-scroller,
                .fc-scroller-harness,
                .fc-view,
                .fc-view-harness,
                .fc-timegrid,
                .fc-daygrid {
                    background: transparent !important;
                    background-color: transparent !important;
                }

                /* Borders — subtle white */
                .fc-theme-standard td,
                .fc-theme-standard th,
                .fc-theme-standard .fc-scrollgrid {
                    border-color: rgba(255,255,255,0.06) !important;
                }

                /* Toolbar title */
                .fc .fc-toolbar-title {
                    font-family: 'Oswald', sans-serif;
                    font-size: 1.1rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    color: rgba(255,255,255,0.7);
                    letter-spacing: 2px;
                }

                /* Nav buttons */
                .fc .fc-button-primary {
                    background-color: rgba(255,255,255,0.05) !important;
                    border: 1px solid rgba(255,255,255,0.08) !important;
                    color: rgba(255,255,255,0.6) !important;
                    font-weight: 600;
                    text-transform: capitalize;
                    border-radius: 8px;
                    padding: 8px 16px;
                    transition: 0.3s;
                    box-shadow: none !important;
                }
                .fc .fc-button-primary:hover {
                    background-color: rgba(255,0,0,0.2) !important;
                    border-color: rgba(255,0,0,0.3) !important;
                    color: #fff !important;
                }
                .fc .fc-button-primary:not(:disabled).fc-button-active,
                .fc .fc-button-primary:not(:disabled):active {
                    background-color: #ff0000 !important;
                    border-color: #ff0000 !important;
                    color: #fff !important;
                }
                .fc .fc-button:focus {
                    box-shadow: 0 0 0 2px rgba(255,0,0,0.25) !important;
                }

                /* Column header (day names) */
                .fc-col-header-cell {
                    background: rgba(255,255,255,0.02) !important;
                }
                .fc-col-header-cell-cushion {
                    color: rgba(255,255,255,0.4) !important;
                    font-family: 'Oswald', sans-serif;
                    font-weight: 600;
                    padding: 12px 0 !important;
                    font-size: 0.8rem;
                    letter-spacing: 1px;
                    text-decoration: none !important;
                }

                /* Time labels */
                .fc-timegrid-slot-label-cushion {
                    color: rgba(255,255,255,0.2) !important;
                    font-size: 0.75rem;
                }
                .fc-timegrid-axis-cushion {
                    color: rgba(255,255,255,0.2) !important;
                }

                /* Today highlight */
                .fc-day-today {
                    background: rgba(255, 0, 0, 0.04) !important;
                }
                .fc-col-header-cell.fc-day-today {
                    background: rgba(255, 0, 0, 0.08) !important;
                }
                .fc-col-header-cell.fc-day-today .fc-col-header-cell-cushion {
                    color: #ff0000 !important;
                }

                /* Day numbers in month view */
                .fc-daygrid-day-number {
                    color: rgba(255,255,255,0.5) !important;
                    text-decoration: none !important;
                }

                /* Events */
                .fc-event {
                    cursor: pointer;
                    transition: transform 0.2s;
                    border: none !important;
                    border-radius: 6px;
                    box-shadow: 0 2px 8px rgba(255,0,0,0.3);
                }
                .fc-event:hover {
                    transform: scale(1.02);
                    filter: brightness(1.15);
                }

                /* Now indicator */
                .fc-timegrid-now-indicator-line {
                    border-color: #ff0000 !important;
                    border-width: 2px !important;
                }
                .fc-timegrid-now-indicator-arrow {
                    border-color: #ff0000 !important;
                    border-top-color: #ff0000 !important;
                }

                /* License / watermark message — hide if present */
                .fc-license-message {
                    display: none !important;
                }

                /* Allday section */
                .fc-timegrid-divider {
                    border-color: rgba(255,255,255,0.06) !important;
                    padding: 0 !important;
                }

                /* Popover (more events) */
                .fc-popover {
                    background: #141414 !important;
                    border-color: rgba(255,255,255,0.1) !important;
                }
                .fc-popover-header {
                    background: rgba(255,255,255,0.05) !important;
                    color: rgba(255,255,255,0.7) !important;
                }

                /* Scrollbar styling */
                .fc .fc-scroller::-webkit-scrollbar {
                    width: 6px;
                }
                .fc .fc-scroller::-webkit-scrollbar-track {
                    background: transparent;
                }
                .fc .fc-scroller::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.08);
                    border-radius: 3px;
                }
                .fc .fc-scroller::-webkit-scrollbar-thumb:hover {
                    background: rgba(255,255,255,0.15);
                }
            `}</style>
        </section>
    );
}