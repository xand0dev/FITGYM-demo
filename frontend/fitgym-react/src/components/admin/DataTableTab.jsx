import { useState } from 'react';
import AdminModal from './AdminModal';
import { useFitMutation } from '../../hooks/useFitQuery'; 

export default function DataTableTab({ data, tabType, onRefresh }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); 
    const [formData, setFormData] = useState({});

    const isTrainer = tabType === 'trainers';
    const title = isTrainer ? 'Тренери' : 'Клієнти';

    const createMutation = useFitMutation('POST');
    const updateMutation = useFitMutation('PUT');
    const deleteMutation = useFitMutation('DELETE');

    const isSubmitting = createMutation.isPending || updateMutation.isPending;
    const isDeleting = deleteMutation.isPending;

    const handleAddNew = () => {
        setModalMode('create');
        setFormData(
            isTrainer 
                ? { username: '', password: '', first_name: '', last_name: '', specialties: '', contact: '' } 
                : { username: '', email: '', first_name: '', last_name: '', password: '', contact: '' }
        );
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setModalMode('edit');
        setFormData(item);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (!window.confirm(`Ви впевнені, що хочете знищити цей запис?`)) return;
        
        const endpoint = isTrainer ? `/api/admin/instructors/${id}/` : `/api/admin/members/${id}/`;
        
        deleteMutation.mutate(
            { endpoint, data: null },
            {
                onSuccess: () => { if (onRefresh) onRefresh(); },
                onError: (e) => alert('Не вдалося видалити: ' + e.message)
            }
        );
    };

    const handleSave = (e) => {
        e.preventDefault();
        
        const endpoint = isTrainer ? '/api/admin/instructors/' : '/api/admin/members/';
        const url = modalMode === 'create' ? endpoint : `${endpoint}${formData.id}/`;
        const mutation = modalMode === 'create' ? createMutation : updateMutation;

        mutation.mutate(
            { endpoint: url, data: formData },
            {
                onSuccess: () => {
                    setIsModalOpen(false);
                    if (onRefresh) onRefresh();
                },
                onError: (e) => alert('Помилка збереження: ' + e.message)
            }
        );
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const getDisplayName = (item) => {
        if (item.full_name) return item.full_name;
        const firstLast = `${item.first_name || ''} ${item.last_name || ''}`.trim();
        return firstLast || item.username || 'Невідомий';
    };

    const inputClasses = "w-full p-[14px] bg-[#1a1a1a] border border-[#333] rounded-lg text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50";
    const labelClasses = "block mb-2 text-[0.8rem] font-bold text-[#888] uppercase tracking-wide";

    return (
        <div className="animate-fadeIn">
            {/* ШАПКА ТАБЛИЦІ З КНОПКОЮ "ДОДАТИ" */}
            <div className="flex justify-between items-center mb-[25px]">
                <h3 className="m-0 color-white text-[1.2rem] uppercase font-extrabold tracking-wide">
                    Довідник: <span className="text-primary">{title}</span>
                </h3>
                <button 
                    onClick={handleAddNew} 
                    className="px-[20px] py-[10px] rounded-lg bg-primary text-white font-bold text-[0.9rem] flex items-center gap-2 uppercase tracking-wide shadow-[0_4px_15px_rgba(255,0,0,0.3)] transition-all duration-300 hover:bg-[#cc0000] hover:-translate-y-0.5"
                >
                    <i className="fas fa-plus"></i> <span className="hidden sm:inline">Додати запис</span>
                </button>
            </div>

            {/* ТАБЛИЦЯ */}
            <div className="w-full overflow-x-auto bg-[#141414]/60 backdrop-blur-[20px] border border-[#222] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] custom-scrollbar">
                <table className="w-full text-left border-collapse whitespace-nowrap min-w-[600px]">
                    <thead>
                        <tr className="border-b border-[#333] bg-white/5">
                            <th className="p-[15px_20px] text-[0.85rem] font-bold text-[#888] uppercase tracking-wide">Користувач</th>
                            <th className="p-[15px_20px] text-[0.85rem] font-bold text-[#888] uppercase tracking-wide">{isTrainer ? 'Спеціалізація' : 'Контакти (Email)'}</th>
                            <th className="p-[15px_20px] text-[0.85rem] font-bold text-[#888] uppercase tracking-wide">Роль</th>
                            <th className="p-[15px_20px] text-[0.85rem] font-bold text-[#888] uppercase tracking-wide text-right">Дії</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data && data.length > 0 ? data.map(item => (
                            <tr key={item.id} className="border-b border-[#222] transition-colors duration-200 hover:bg-white/5 last:border-none">
                                <td className="p-[15px_20px]">
                                    <div className="flex items-center gap-[15px]">
                                        <div className="w-[36px] h-[36px] bg-primary/20 text-primary flex items-center justify-center rounded-lg font-bold text-[1rem]">
                                            {getDisplayName(item).charAt(0).toUpperCase()}
                                        </div>
                                        <strong className="text-white text-[1rem]">{getDisplayName(item)}</strong>
                                    </div>
                                </td>
                                <td className="p-[15px_20px]">
                                    <span className="text-[#aaa] text-[0.9rem]">
                                        {isTrainer ? (item.specialties || '—') : (item.email || '—')}
                                    </span>
                                </td>
                                <td className="p-[15px_20px]">
                                    <span className="inline-block bg-white/5 text-white border border-[#333] px-2.5 py-1 rounded-md text-[0.8rem] font-semibold tracking-wide">
                                        {isTrainer ? 'Тренер' : 'Клієнт'}
                                    </span>
                                </td>
                                <td className="p-[15px_20px]">
                                    <div className="flex gap-[12px] justify-end">
                                        <button 
                                            title="Редагувати" 
                                            onClick={() => handleEdit(item)}
                                            disabled={isDeleting}
                                            className="w-[32px] h-[32px] rounded-md bg-[#222] text-[#aaa] flex items-center justify-center transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
                                        >
                                            <i className="fas fa-pen"></i>
                                        </button>
                                        <button 
                                            title="Видалити" 
                                            onClick={() => handleDelete(item.id)} 
                                            disabled={isDeleting}
                                            className="w-[32px] h-[32px] rounded-md bg-primary/10 border border-primary/20 text-primary flex items-center justify-center transition-colors hover:bg-primary/20 hover:text-[#ff1a1a] disabled:opacity-50"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className="text-center text-[#666] p-[40px] font-medium">
                                    Дані відсутні. Натисніть "Додати запис".
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* УНІВЕРСАЛЬНА МОДАЛКА */}
            <AdminModal 
                isOpen={isModalOpen} 
                onClose={() => !isSubmitting && setIsModalOpen(false)} 
                title={modalMode === 'create' ? `Новий ${isTrainer ? 'тренер' : 'клієнт'}` : `Редагування`}
            >
                <form className="flex flex-col gap-5" onSubmit={handleSave}>
                    
                    {isTrainer ? (
                        <>
                            <div>
                                <label className={labelClasses}>Username (Логін)</label>
                                <input type="text" name="username" value={formData.username || ''} onChange={handleChange} required disabled={modalMode === 'edit' || isSubmitting} className={inputClasses} />
                            </div>
                            
                            {modalMode === 'create' && (
                                <div>
                                    <label className={labelClasses}>Пароль</label>
                                    <input type="password" name="password" value={formData.password || ''} onChange={handleChange} required minLength="6" disabled={isSubmitting} className={inputClasses} />
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className={labelClasses}>Ім'я</label>
                                    <input type="text" name="first_name" value={formData.first_name || ''} onChange={handleChange} required disabled={isSubmitting} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Прізвище</label>
                                    <input type="text" name="last_name" value={formData.last_name || ''} onChange={handleChange} required disabled={isSubmitting} className={inputClasses} />
                                </div>
                            </div>
                            <div>
                                <label className={labelClasses}>Спеціалізація</label>
                                <input type="text" name="specialties" value={formData.specialties || ''} onChange={handleChange} placeholder="Crossfit, Yoga, Boxing..." required disabled={isSubmitting} className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Контакт (Телефон)</label>
                                <input type="text" name="contact" value={formData.contact || ''} onChange={handleChange} placeholder="+380..." disabled={isSubmitting} className={inputClasses} />
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className={labelClasses}>Username (Логін)</label>
                                <input type="text" name="username" value={formData.username || ''} onChange={handleChange} required disabled={modalMode === 'edit' || isSubmitting} className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Email адрес</label>
                                <input type="email" name="email" value={formData.email || ''} onChange={handleChange} required disabled={isSubmitting} className={inputClasses} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className={labelClasses}>Ім'я</label>
                                    <input type="text" name="first_name" value={formData.first_name || ''} onChange={handleChange} required disabled={isSubmitting} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Прізвище</label>
                                    <input type="text" name="last_name" value={formData.last_name || ''} onChange={handleChange} required disabled={isSubmitting} className={inputClasses} />
                                </div>
                            </div>
                            {modalMode === 'create' && (
                                <div>
                                    <label className={labelClasses}>Пароль</label>
                                    <input type="password" name="password" value={formData.password || ''} onChange={handleChange} required minLength="6" disabled={isSubmitting} className={inputClasses} />
                                </div>
                            )}
                        </>
                    )}
                    
                    <div className="mt-4 flex flex-col sm:flex-row justify-end gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="w-full sm:w-auto px-[25px] py-[14px] bg-transparent border border-[#444] text-[#aaa] rounded-lg font-bold uppercase tracking-wide transition-colors hover:border-white hover:text-white disabled:opacity-50">
                            Скасувати
                        </button>
                        <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-[25px] py-[14px] bg-primary text-white rounded-lg font-extrabold uppercase tracking-wide shadow-[0_4px_15px_rgba(255,0,0,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,0,0,0.5)] hover:bg-[#cc0000] disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2">
                            <i className={isSubmitting ? "fas fa-spinner fa-spin" : "fas fa-check"}></i> 
                            {isSubmitting ? 'ОБРОБКА...' : 'ЗБЕРЕГТИ'}
                        </button>
                    </div>
                </form>
            </AdminModal>
            
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.4s ease forwards; }
                .custom-scrollbar::-webkit-scrollbar { height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 6px; }
            `}</style>
        </div>
    );
}