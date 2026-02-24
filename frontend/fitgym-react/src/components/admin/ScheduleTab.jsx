import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ukLocale from '@fullcalendar/core/locales/uk';
import AdminModal from './AdminModal';

// Підключаємо наш бойовий арсенал React Query
import { usePublicData, useAuthData, useFitMutation } from '../../hooks/useFitQuery';

export default function ScheduleTab() {
    // Стейт модалки та форми
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' або 'edit'
    
    const [formData, setFormData] = useState({
        id: null,
        class_type: '',
        instructor: '',
        start_at: '',
        end_at: '',
        capacity: 15
    });

    // --- 1. ОТРИМАННЯ ДАНИХ (РАДАР) ---
    // Кешуємо довідники, щоб не вантажити їх постійно
    const { data: classes = [] } = usePublicData('classes', '/api/classes/');
    const { data: instructors = [] } = useAuthData('admin-trainers', '/api/admin/instructors/');
    const { data: scheduleData = [] } = usePublicData('admin-schedule', '/api/schedule/');

    // --- 2. БОЙОВІ МУТАЦІЇ (АРТИЛЕРІЯ) ---
    const createMutation = useFitMutation('POST');
    const updateMutation = useFitMutation('PUT');
    const deleteMutation = useFitMutation('DELETE');

    // Блокуємо інтерфейс під час атаки на сервер
    const isSubmitting = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

    // Форматуємо події для календаря (виконується автоматично при отриманні scheduleData)
    const events = scheduleData.map(session => ({
        id: session.id,
        title: session.class_name || 'Заняття',
        start: session.start_at,
        end: session.end_at,
        extendedProps: {
            instructor: session.instructor,
            class_type: session.class_type,
            capacity: session.capacity
        }
    }));

    // Клік по пустому місцю (Створення)
    const handleDateSelect = (selectInfo) => {
        setModalMode('create');
        setFormData({
            id: null,
            class_type: classes.length > 0 ? classes[0].id : '',
            instructor: instructors.length > 0 ? instructors[0].id : '',
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

    // Збереження (Створення або Оновлення)
    const handleSave = (e) => {
        e.preventDefault();
        
        const payload = {
            class_type: parseInt(formData.class_type),
            instructor: parseInt(formData.instructor),
            start_at: new Date(formData.start_at).toISOString(),
            end_at: new Date(formData.end_at).toISOString(),
            capacity: parseInt(formData.capacity)
        };

        const endpoint = modalMode === 'create' ? '/api/admin/schedule/' : `/api/admin/schedule/${formData.id}/`;
        const mutation = modalMode === 'create' ? createMutation : updateMutation;

        mutation.mutate(
            { endpoint, data: payload },
            {
                onSuccess: () => setIsModalOpen(false),
                onError: (error) => alert('Помилка збереження: ' + error.message)
            }
        );
    };

    // Видалення
    const handleDelete = () => {
        if (!window.confirm('Знищити це тренування з бази?')) return;
        
        deleteMutation.mutate(
            { endpoint: `/api/admin/schedule/${formData.id}/`, data: null },
            {
                onSuccess: () => setIsModalOpen(false),
                onError: (error) => alert('Помилка видалення: ' + error.message)
            }
        );
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
                onClose={() => !isSubmitting && setIsModalOpen(false)} 
                title={modalMode === 'create' ? 'Створити тренування' : 'Редагувати тренування'}
            >
                <form className="admin-form" onSubmit={handleSave}>
                    <div className="form-group">
                        <label>Тип заняття (Class)</label>
                        <select 
                            value={formData.class_type} 
                            onChange={e => setFormData({...formData, class_type: e.target.value})}
                            required
                            disabled={isSubmitting}
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
                            disabled={isSubmitting}
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
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="form-group">
                            <label>Кінець</label>
                            <input 
                                type="datetime-local" 
                                value={formData.end_at} 
                                onChange={e => setFormData({...formData, end_at: e.target.value})} 
                                required
                                disabled={isSubmitting}
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
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="modal-actions">
                        {modalMode === 'edit' && (
                            <button 
                                type="button" 
                                className="btn-delete" 
                                onClick={handleDelete}
                                disabled={isSubmitting}
                            >
                                <i className="fas fa-trash"></i> Видалити
                            </button>
                        )}
                        <div className="action-right" style={{ width: modalMode === 'create' ? '100%' : 'auto' }}>
                            <button 
                                type="button" 
                                className="btn-cancel" 
                                onClick={() => setIsModalOpen(false)}
                                disabled={isSubmitting}
                            >
                                Скасувати
                            </button>
                            <button 
                                type="submit" 
                                className="btn-save"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'ОБРОБКА...' : 'ЗБЕРЕГТИ'}
                            </button>
                        </div>
                    </div>
                </form>
            </AdminModal>
        </div>
    );
}