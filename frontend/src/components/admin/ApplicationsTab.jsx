import React, { useState } from 'react';
import { useFitMutation } from '../../hooks/useFitQuery';
import { useUI } from '../../context/UIContext';
import { Edit, Trash2, Check, Loader2 } from 'lucide-react';
import PremiumTable from '../ui/PremiumTable';
import SlideOverModal from '../ui/SlideOverModal';
import { cn } from '../../lib/utils';

export default function ApplicationsTab({ data, onRefresh, isLoading = false }) {
    const { addToast } = useUI();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({});

    const updateMutation = useFitMutation('PUT');
    const deleteMutation = useFitMutation('DELETE');
    const isSubmitting = updateMutation.isPending || deleteMutation.isPending;

    const handleEdit = (item) => {
        setFormData(item);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (!window.confirm('Ви впевнені, що хочете видалити цю заявку?')) return;
        deleteMutation.mutate(
            { endpoint: `/api/admin/applications/${id}/`, data: null },
            {
                onSuccess: () => { if (onRefresh) onRefresh(); },
                onError: (e) => addToast('Не вдалося видалити: ' + e.message, 'error')
            }
        );
    };

    const handleSave = (e) => {
        e.preventDefault();
        updateMutation.mutate(
            { endpoint: `/api/admin/applications/${formData.id}/`, data: formData },
            {
                onSuccess: () => {
                    setIsModalOpen(false);
                    if (onRefresh) onRefresh();
                    addToast('Статус успішно оновлено!', 'success');
                },
                onError: (e) => addToast('Помилка збереження: ' + e.message, 'error')
            }
        );
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'new':
                return <span className="inline-flex items-center justify-center bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest shadow-[inset_0_0_10px_rgba(59,130,246,0.1)]">Нова</span>;
            case 'in_progress':
                return <span className="inline-flex items-center justify-center bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest shadow-[inset_0_0_10px_rgba(234,179,8,0.1)]">В роботі</span>;
            case 'completed':
                return <span className="inline-flex items-center justify-center bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest shadow-[inset_0_0_10px_rgba(34,197,94,0.1)]">Продано</span>;
            case 'cancelled':
                return <span className="inline-flex items-center justify-center bg-red-500/10 border border-red-500/20 text-red-500 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest shadow-[inset_0_0_10px_rgba(239,68,68,0.1)]">Відмова</span>;
            default:
                return <span className="inline-flex items-center justify-center bg-white/5 border border-white/10 text-[#aaaaaa] px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest">{status}</span>;
        }
    };

    const columns = [
        { label: 'Дата', className: '' },
        { label: 'Клієнт', className: '' },
        { label: 'Тариф', className: '' },
        { label: 'Статус', className: '' },
        { label: 'Дії', className: 'text-right' },
    ];

    const renderRow = (item) => (
        <>
            <td className="p-4">
                <span className="text-[#aaaaaa] font-semibold text-sm">
                    {new Date(item.created_at).toLocaleDateString('uk-UA')}
                </span>
            </td>
            <td className="p-4">
                <div className="flex flex-col">
                    <strong className="text-[#ffffff] font-extrabold text-base">{item.name}</strong>
                    <span className="text-primary text-sm font-bold tracking-wide mt-1">{item.phone}</span>
                </div>
            </td>
            <td className="p-4">
                <span className="text-[#ffffff] font-bold">
                    {item.membership_type_name || 'Не вказано'}
                </span>
            </td>
            <td className="p-4">
                {getStatusBadge(item.status)}
            </td>
            <td className="p-4">
                <div className="flex gap-2 justify-end">
                    <button
                        title="Обробити заявку"
                        onClick={() => handleEdit(item)}
                        disabled={isSubmitting}
                        className="w-9 h-9 rounded-lg bg-white/5 border border-transparent text-[#aaaaaa] flex items-center justify-center transition-colors hover:bg-white/10 hover:text-[#ffffff] disabled:opacity-50"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        title="Видалити"
                        onClick={() => handleDelete(item.id)}
                        disabled={isSubmitting}
                        className="w-9 h-9 rounded-lg bg-red-500/10 border border-transparent text-red-500 flex items-center justify-center transition-colors hover:bg-red-500/20 hover:border-red-500/30 disabled:opacity-50"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </>
    );

    const inputClasses = cn(
        "w-full p-4 rounded-xl text-[#ffffff] font-semibold outline-none transition-all duration-300 disabled:opacity-50 appearance-none cursor-pointer",
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
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-black uppercase tracking-wider text-[#ffffff] flex items-center gap-2">
                    Лійка продажів: <span className="text-primary">Заявки</span>
                </h3>
            </div>

            {/* Table */}
            <PremiumTable
                columns={columns}
                data={data}
                keyExtractor={(item) => item.id}
                renderRow={renderRow}
                emptyMessage="Нових заявок ще немає."
            />

            {/* Processing Modal via SlideOverModal */}
            <SlideOverModal
                isOpen={isModalOpen}
                onClose={() => !isSubmitting && setIsModalOpen(false)}
                title="Обробка заявки"
            >
                <form className="flex flex-col gap-6 h-full" onSubmit={handleSave}>

                    {/* Information Card */}
                    <div className="p-5 rounded-xl bg-[#141414] border border-[#222] flex flex-col gap-3">
                        <div className="flex justify-between items-center border-b border-[#333] pb-3">
                            <span className="text-xs font-bold text-[#aaaaaa] uppercase tracking-wider">Клієнт</span>
                            <span className="text-sm font-extrabold text-[#ffffff]">{formData.name}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-[#333] pb-3">
                            <span className="text-xs font-bold text-[#aaaaaa] uppercase tracking-wider">Телефон</span>
                            <span className="text-sm font-extrabold text-primary">{formData.phone}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-[#aaaaaa] uppercase tracking-wider">Цікавить</span>
                            <span className="text-sm font-extrabold text-[#ffffff]">{formData.membership_type_name || '—'}</span>
                        </div>
                    </div>

                    {/* Status Dropdown */}
                    <div>
                        <label className={labelClasses}>Оновити статус</label>
                        <div className="relative">
                            <select
                                name="status"
                                value={formData.status || 'new'}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                disabled={isSubmitting}
                                className={inputClasses}
                            >
                                <option value="new">Нова (Не оброблено)</option>
                                <option value="in_progress">В роботі (Думає)</option>
                                <option value="completed">Успішно продано</option>
                                <option value="cancelled">Відмова</option>
                            </select>
                            {/* Custom Down Arrow purely for aesthetics since appearance is none */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#aaaaaa]">
                                ▼
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto pt-6 flex flex-col gap-3">
                        <button type="submit" disabled={isSubmitting} className="w-full px-6 py-4 rounded-xl bg-primary text-white font-black uppercase tracking-wider shadow-[0_4px_15px_rgba(204,0,0,0.3)] transition-all duration-300 hover:bg-[#cc0000] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(204,0,0,0.4)] disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2">
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                            {isSubmitting ? 'ЗБЕРЕЖЕННЯ...' : 'ЗБЕРЕГТИ СТАТУС'}
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