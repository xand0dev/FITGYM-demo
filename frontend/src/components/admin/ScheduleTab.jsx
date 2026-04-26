import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ukLocale from '@fullcalendar/core/locales/uk';
import AdminModal from './AdminModal';

import { usePublicData, useAuthData, useFitMutation } from '../../hooks/useFitQuery';
import { useUI } from '../../context/UIContext';

export default function ScheduleTab() {
    const { addToast } = useUI();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    
    const [formData, setFormData] = useState({
        id: null,
        class_type: '',
        instructor: '',
        start_at: '',
        end_at: '',
        capacity: 15
    });

    const { data: classes = [] } = usePublicData('classes', '/api/classes/');
    const { data: instructors = [] } = useAuthData('admin-trainers', '/api/admin/instructors/');
    const { data: scheduleData = [] } = usePublicData('admin-schedule', '/api/schedule/');

    const createMutation = useFitMutation('POST');
    const updateMutation = useFitMutation('PUT');
    const deleteMutation = useFitMutation('DELETE');

    const isSubmitting = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

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
                onSuccess: () => {
                    setIsModalOpen(false);
                    addToast(`Заняття успішно ${modalMode === 'create' ? 'додано' : 'оновлено'}!`, 'success');
                },
                onError: (error) => addToast('Помилка збереження: ' + error.message, 'error')
            }
        );
    };

    const handleDelete = () => {
        if (!window.confirm('Знищити це тренування з бази?')) return;

        deleteMutation.mutate(
            { endpoint: `/api/admin/schedule/${formData.id}/`, data: null },
            {
                onSuccess: () => {
                    setIsModalOpen(false);
                    addToast('Заняття видалено.', 'success');
                },
                onError: (error) => addToast('Помилка видалення: ' + error.message, 'error')
            }
        );
    };

    const inputClasses = "w-full p-[14px] bg-[#1a1a1a] border border-[#333] rounded-lg text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50";
    const labelClasses = "block mb-2 text-[0.8rem] font-bold text-[#888] uppercase tracking-wide";

    return (
        <div className="animate-fadeIn">
            <div className="bg-[#141414]/60 backdrop-blur-[20px] border border-[#222] rounded-2xl p-[20px] lg:p-[30px] shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
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
            </div>

            <AdminModal 
                isOpen={isModalOpen} 
                onClose={() => !isSubmitting && setIsModalOpen(false)} 
                title={modalMode === 'create' ? 'Створити тренування' : 'Редагувати тренування'}
            >
                <form className="flex flex-col gap-5" onSubmit={handleSave}>
                    <div>
                        <label className={labelClasses}>Тип заняття (Class)</label>
                        <select value={formData.class_type} onChange={e => setFormData({...formData, class_type: e.target.value})} required disabled={isSubmitting} className={inputClasses}>
                            <option value="" disabled>Оберіть заняття...</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className={labelClasses}>Тренер</label>
                        <select value={formData.instructor} onChange={e => setFormData({...formData, instructor: e.target.value})} required disabled={isSubmitting} className={inputClasses}>
                            <option value="" disabled>Оберіть тренера...</option>
                            {instructors.map(i => <option key={i.id} value={i.id}>{i.full_name || i.username}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className={labelClasses}>Початок</label>
                            <input type="datetime-local" value={formData.start_at} onChange={e => setFormData({...formData, start_at: e.target.value})} required disabled={isSubmitting} className={inputClasses} />
                        </div>
                        <div>
                            <label className={labelClasses}>Кінець</label>
                            <input type="datetime-local" value={formData.end_at} onChange={e => setFormData({...formData, end_at: e.target.value})} required disabled={isSubmitting} className={inputClasses} />
                        </div>
                    </div>

                    <div>
                        <label className={labelClasses}>Макс. кількість місць</label>
                        <input type="number" min="1" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} required disabled={isSubmitting} className={inputClasses} />
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row justify-between gap-3">
                        {modalMode === 'edit' ? (
                            <button type="button" onClick={handleDelete} disabled={isSubmitting} className="w-full sm:w-auto px-[20px] py-[14px] bg-transparent text-[#ff4d4d] flex items-center justify-center gap-2 font-bold uppercase transition-colors hover:bg-[#ff4d4d]/10 rounded-lg">
                                <i className="fas fa-trash"></i> Видалити
                            </button>
                        ) : <div></div>}
                        
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="w-full sm:w-auto px-[25px] py-[14px] bg-transparent border border-[#444] text-[#aaa] rounded-lg font-bold uppercase tracking-wide transition-colors hover:border-white hover:text-white disabled:opacity-50">
                                Скасувати
                            </button>
                            <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-[25px] py-[14px] bg-primary text-white rounded-lg font-extrabold uppercase tracking-wide shadow-[0_4px_15px_rgba(255,0,0,0.3)] transition-all hover:-translate-y-0.5 hover:bg-[#cc0000] disabled:opacity-50">
                                {isSubmitting ? 'ОБРОБКА...' : 'ЗБЕРЕГТИ'}
                            </button>
                        </div>
                    </div>
                </form>
            </AdminModal>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.4s ease forwards; }

                /* FullCalendar Темна Тема Tailwind */
                .fc-theme-standard td, .fc-theme-standard th { border-color: #222 !important; }
                .fc .fc-toolbar-title { font-size: 1.5rem; font-weight: 800; text-transform: uppercase; color: #fff; letter-spacing: 1px; }
                
                .fc .fc-button-primary { background-color: #2a2a2a; border: none; color: #aaa; text-transform: capitalize; border-radius: 8px; transition: 0.3s; padding: 8px 16px; font-weight: 600;}
                .fc .fc-button-primary:hover { background-color: #333; color: #fff; }
                .fc .fc-button-active, .fc .fc-button-primary:not(:disabled):active { background-color: #ff0000 !important; color: #fff !important; }
                
                .fc-col-header-cell-cushion { color: #888; text-transform: uppercase; font-size: 0.85rem; padding: 10px 0 !important; font-weight: 800;}
                .fc-timegrid-slot-label-cushion { color: #888; font-size: 0.85rem; }
                
                .fc-event { border: none; border-radius: 6px; padding: 2px 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.4); cursor: pointer; transition: 0.2s; background-color: #ff0000; }
                .fc-event:hover { transform: scale(1.02); filter: brightness(1.2); }
                .fc-event-main { font-weight: 700; font-size: 0.85rem; color: #fff; padding: 2px;}
                
                .fc-day-today { background: rgba(255, 0, 0, 0.05) !important; }
                .fc .fc-highlight { background: rgba(255, 255, 255, 0.05); }
                .fc-timegrid-now-indicator-line { border-color: #ff0000; }
                .fc-timegrid-now-indicator-arrow { border-color: #ff0000; background: #ff0000; }
                
                /* Виправлення іконки стрілок в Safari/Chrome */
                .fc-icon { color: inherit; }
            `}</style>
        </div>
    );
}