import React, { useState } from 'react';
import { useFitMutation } from '../../hooks/useFitQuery';
import { useUI } from '../../context/UIContext';
import { Plus, Edit, Trash2, Check, Loader2 } from 'lucide-react';
import PremiumTable from '../ui/PremiumTable';
import SlideOverModal from '../ui/SlideOverModal';
import { cn } from '../../lib/utils';

export default function TrainersTab({ data, onRefresh, isLoading = false }) {
    const { addToast } = useUI();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [formData, setFormData] = useState({});

    const createMutation = useFitMutation('POST');
    const updateMutation = useFitMutation('PUT');
    const deleteMutation = useFitMutation('DELETE');

    const isSubmitting = createMutation.isPending || updateMutation.isPending;
    const isDeleting = deleteMutation.isPending;

    const handleAddNew = () => {
        setModalMode('create');
        setFormData({ username: '', password: '', first_name: '', last_name: '', specialties: '', contact: '' });
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setModalMode('edit');
        setFormData(item);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (!window.confirm(`Ви впевнені, що хочете видалити цього тренера?`)) return;

        deleteMutation.mutate(
            { endpoint: `/api/admin/instructors/${id}/`, data: null },
            {
                onSuccess: () => { if (onRefresh) onRefresh(); },
                onError: (e) => addToast('Не вдалося видалити: ' + e.message, 'error')
            }
        );
    };

    const handleSave = (e) => {
        e.preventDefault();

        const endpoint = '/api/admin/instructors/';
        const url = modalMode === 'create' ? endpoint : `${endpoint}${formData.id}/`;
        const mutation = modalMode === 'create' ? createMutation : updateMutation;

        mutation.mutate(
            { endpoint: url, data: formData },
            {
                onSuccess: () => {
                    setIsModalOpen(false);
                    if (onRefresh) onRefresh();
                    addToast(`Тренера успішно ${modalMode === 'create' ? 'додано' : 'оновлено'}!`, 'success');
                },
                onError: (e) => addToast('Помилка збереження: ' + e.message, 'error')
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

    const columns = [
        { label: 'Користувач', className: '' },
        { label: 'Спеціалізація', className: '' },
        { label: 'Роль', className: '' },
        { label: 'Дії', className: 'text-right' },
    ];

    const renderRow = (item) => (
        <>
            <td className="p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center rounded-lg font-black text-lg">
                        {getDisplayName(item).charAt(0).toUpperCase()}
                    </div>
                    <strong className="text-[#ffffff] font-extrabold">{getDisplayName(item)}</strong>
                </div>
            </td>
            <td className="p-4">
                <span className="text-[#aaaaaa] font-semibold text-sm">
                    {item.specialties || '—'}
                </span>
            </td>
            <td className="p-4">
                <span className="inline-block bg-[#141414] text-[#ffffff] border border-[#222] px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider">
                    Тренер
                </span>
            </td>
            <td className="p-4">
                <div className="flex gap-2 justify-end">
                    <button
                        title="Редагувати"
                        onClick={() => handleEdit(item)}
                        disabled={isDeleting}
                        className="w-9 h-9 rounded-lg bg-white/5 border border-transparent text-[#aaaaaa] flex items-center justify-center transition-colors hover:bg-[#333] hover:text-[#ffffff] disabled:opacity-50"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        title="Видалити"
                        onClick={() => handleDelete(item.id)}
                        disabled={isDeleting}
                        className="w-9 h-9 rounded-lg bg-red-500/10 border border-transparent text-red-500 flex items-center justify-center transition-colors hover:bg-red-500/20 hover:border-red-500/30 disabled:opacity-50"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </>
    );

    const inputClasses = cn(
        "w-full p-4 rounded-xl text-[#ffffff] font-semibold outline-none transition-all duration-300 disabled:opacity-50",
        "bg-[#1a1a1a] border border-[#333] focus:border-primary focus:shadow-[0_0_15px_rgba(204,0,0,0.15)] focus:bg-[#222]"
    );
    const labelClasses = "block mb-2 text-xs font-black text-[#aaaaaa] uppercase tracking-wider";

    if (isLoading) {
        return (
            <div className="animate-fade-in flex items-center justify-center py-24 text-[#888]">
                <Loader2 className="w-6 h-6 animate-spin mr-3" />
                <span className="font-semibold text-sm uppercase tracking-wider">Завантаження...</span>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h3 className="text-xl font-black uppercase tracking-wider text-[#ffffff] flex items-center gap-2">
                    Довідник: <span className="text-primary">Тренери</span>
                </h3>
                <button
                    onClick={handleAddNew}
                    className="px-5 py-2.5 rounded-lg bg-primary text-white font-black text-sm flex items-center justify-center gap-2 uppercase tracking-wide transition-all duration-300 hover:bg-[#cc0000] hover:-translate-y-0.5 shadow-[0_4px_15px_rgba(255,0,0,0.3)] disabled:opacity-50"
                >
                    <Plus className="w-4 h-4" />
                    <span>Додати запис</span>
                </button>
            </div>

            {/* Table */}
            <PremiumTable
                columns={columns}
                data={data}
                keyExtractor={(item) => item.id}
                renderRow={renderRow}
                emptyMessage="Тренерів не знайдено."
            />

            {/* Slide-over Create/Edit Interface */}
            <SlideOverModal
                isOpen={isModalOpen}
                onClose={() => !isSubmitting && setIsModalOpen(false)}
                title={modalMode === 'create' ? 'Новий Тренер' : 'Редагування Тренера'}
            >
                <form onSubmit={handleSave} className="flex flex-col gap-5 h-full">
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                    <div className="mt-auto pt-6 flex flex-col gap-3">
                        <button type="submit" disabled={isSubmitting} className="w-full px-6 py-4 rounded-xl bg-primary text-white font-black uppercase tracking-wider shadow-[0_4px_15px_rgba(204,0,0,0.3)] transition-all duration-300 hover:bg-[#cc0000] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(204,0,0,0.4)] disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2">
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                            {isSubmitting ? 'ЗБЕРЕЖЕННЯ...' : 'ЗБЕРЕГТИ ДАНІ'}
                        </button>
                        <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="w-full px-6 py-4 rounded-xl border border-[#333] bg-transparent text-[#aaaaaa] font-black uppercase tracking-wider transition-all hover:bg-white/5 hover:text-[#ffffff] hover:border-white/20 disabled:opacity-50">
                            Скасувати
                        </button>
                    </div>
                </form>
            </SlideOverModal>
        </div>
    );
}
