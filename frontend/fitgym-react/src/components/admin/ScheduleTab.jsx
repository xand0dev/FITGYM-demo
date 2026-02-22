import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ukLocale from '@fullcalendar/core/locales/uk';
import { authRequest, publicRequest } from '../../utils/api';
import AdminModal from './AdminModal';

export default function ScheduleTab() {
    const [events, setEvents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [instructors, setInstructors] = useState([]);
    
    // Стейт модалки
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' або 'edit'
    
    // Стейт форми
    const [formData, setFormData] = useState({
        id: null,
        class_type: '',
        instructor: '',
        start_at: '',
        end_at: '',
        capacity: 15
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            // Отримуємо довідники для селектів та самі події
            const [classesData, instructorsData, scheduleData] = await Promise.all([
                publicRequest('/api/classes/').catch(() => []),
                authRequest('/api/admin/instructors/').catch(() => []),
                publicRequest('/api/schedule/').catch(() => [])
            ]);
            
            setClasses(classesData || []);
            setInstructors(instructorsData || []);
            
            // Форматуємо дані для FullCalendar
            if (scheduleData) {
                const formattedEvents = scheduleData.map(session => ({
                    id: session.id,
                    title: session.class_name || 'Заняття',
                    start: session.start_at,
                    end: session.end_at,
                    extendedProps: {
                        instructor: session.instructor, // ID тренера, якщо є
                        class_type: session.class_type, // ID класу
                        capacity: session.capacity
                    }
                }));
                setEvents(formattedEvents);
            }
        } catch (error) {
            console.error("Помилка завантаження розкладу:", error);
        }
    };

    // Клік по пустому місцю (Створення)
    const handleDateSelect = (selectInfo) => {
        setModalMode('create');
        setFormData({
            id: null,
            class_type: classes.length > 0 ? classes[0].id : '',
            instructor: instructors.length > 0 ? instructors[0].id : '',
            // Форматуємо дату для datetime-local інпута (YYYY-MM-DDTHH:mm)
            start_at: selectInfo.startStr.slice(0, 16),
            end_at: selectInfo.endStr.slice(0, 16),
            capacity: 15
        });
        setIsModalOpen(true);
    };

    // Клік по існуючій події (Редагування/Видалення)
    const handleEventClick = (clickInfo) => {
        const event = clickInfo.event;
        setModalMode('edit');
        setFormData({
            id: event.id,
            class_type: event.extendedProps.class_type || (classes[0]?.id || ''),
            instructor: event.extendedProps.instructor || (instructors[0]?.id || ''),
            start_at: event.startStr.slice(0, 16),
            end_at: event.endStr ? event.endStr.slice(0, 16) : event.startStr.slice(0, 16),
            capacity: event.extendedProps.capacity || 15
        });
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                class_type: parseInt(formData.class_type),
                instructor: parseInt(formData.instructor),
                start_at: new Date(formData.start_at).toISOString(),
                end_at: new Date(formData.end_at).toISOString(),
                capacity: parseInt(formData.capacity)
            };

            if (modalMode === 'create') {
                await authRequest('/api/admin/schedule/', 'POST', payload);
            } else {
                await authRequest(`/api/admin/schedule/${formData.id}/`, 'PUT', payload);
            }
            
            setIsModalOpen(false);
            fetchInitialData(); // Оновлюємо календар
        } catch (error) {
            alert('Помилка збереження: ' + error.message);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Видалити це тренування?')) return;
        try {
            await authRequest(`/api/admin/schedule/${formData.id}/`, 'DELETE');
            setIsModalOpen(false);
            fetchInitialData();
        } catch (error) {
            alert('Помилка видалення: ' + error.message);
        }
    };

    return (
        <div className="admin-calendar-box fade-in">
            <FullCalendar 
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} 
                initialView="timeGridWeek" 
                locale={ukLocale} 
                height="80vh"
                events={events}
                selectable={true}
                selectMirror={true}
                select={handleDateSelect}
                eventClick={handleEventClick}
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
            />

            <AdminModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={modalMode === 'create' ? 'Створити тренування' : 'Редагувати тренування'}
            >
                <form className="admin-form" onSubmit={handleSave}>
                    <div className="form-group">
                        <label>Тип заняття (Class)</label>
                        <select 
                            value={formData.class_type} 
                            onChange={e => setFormData({...formData, class_type: e.target.value})}
                            required
                        >
                            <option value="" disabled>Оберіть заняття...</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Тренер</label>
                        <select 
                            value={formData.instructor} 
                            onChange={e => setFormData({...formData, instructor: e.target.value})}
                            required
                        >
                            <option value="" disabled>Оберіть тренера...</option>
                            {instructors.map(i => (
                                <option key={i.id} value={i.id}>{i.full_name || i.username}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Початок</label>
                            <input 
                                type="datetime-local" 
                                value={formData.start_at} 
                                onChange={e => setFormData({...formData, start_at: e.target.value})} 
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Кінець</label>
                            <input 
                                type="datetime-local" 
                                value={formData.end_at} 
                                onChange={e => setFormData({...formData, end_at: e.target.value})} 
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Макс. кількість місць</label>
                        <input 
                            type="number" 
                            min="1" 
                            value={formData.capacity} 
                            onChange={e => setFormData({...formData, capacity: e.target.value})} 
                            required
                        />
                    </div>

                    <div className="modal-actions">
                        {modalMode === 'edit' && (
                            <button type="button" className="btn-delete" onClick={handleDelete}>
                                <i className="fas fa-trash"></i> Видалити
                            </button>
                        )}
                        <div className="action-right">
                            <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Скасувати</button>
                            <button type="submit" className="btn-save">Зберегти</button>
                        </div>
                    </div>
                </form>
            </AdminModal>
        </div>
    );
}