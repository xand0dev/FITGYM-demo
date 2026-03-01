import { useState } from 'react';
import AdminModal from './AdminModal';
import { useFitMutation } from '../../hooks/useFitQuery';

export default function ApplicationsTab({ data, onRefresh }) {
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
                onError: (e) => alert('Не вдалося видалити: ' + e.message)
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
                },
                onError: (e) => alert('Помилка збереження: ' + e.message)
            }
        );
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'new': return <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-bold uppercase border border-blue-500/30">Нова</span>;
            case 'in_progress': return <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-bold uppercase border border-yellow-500/30">В роботі</span>;
            case 'completed': return <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold uppercase border border-green-500/30">Продано</span>;
            case 'cancelled': return <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-bold uppercase border border-red-500/30">Відмова</span>;
            default: return status;
        }
    };

    const inputClasses = "w-full p-[14px] bg-[#1a1a1a] border border-[#333] rounded-lg text-white outline-none focus:border-primary transition-colors disabled:opacity-50";

    return (
        <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-[25px]">
                <h3 className="m-0 color-white text-[1.2rem] uppercase font-extrabold tracking-wide">
                    Лійка продажів: <span className="text-primary">Заявки</span>
                </h3>
            </div>

            <div className="w-full overflow-x-auto bg-[#141414]/60 backdrop-blur-[20px] border border-[#222] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] custom-scrollbar">
                <table className="w-full text-left border-collapse whitespace-nowrap min-w-[700px]">
                    <thead>
                        <tr className="border-b border-[#333] bg-white/5">
                            <th className="p-[15px_20px] text-[0.85rem] font-bold text-[#888] uppercase tracking-wide">Дата</th>
                            <th className="p-[15px_20px] text-[0.85rem] font-bold text-[#888] uppercase tracking-wide">Клієнт</th>
                            <th className="p-[15px_20px] text-[0.85rem] font-bold text-[#888] uppercase tracking-wide">Тариф</th>
                            <th className="p-[15px_20px] text-[0.85rem] font-bold text-[#888] uppercase tracking-wide">Статус</th>
                            <th className="p-[15px_20px] text-[0.85rem] font-bold text-[#888] uppercase tracking-wide text-right">Дії</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data && data.length > 0 ? data.map(item => (
                            <tr key={item.id} className="border-b border-[#222] transition-colors duration-200 hover:bg-white/5 last:border-none">
                                <td className="p-[15px_20px] text-[#aaa] text-[0.9rem]">
                                    {new Date(item.created_at).toLocaleDateString('uk-UA')}
                                </td>
                                <td className="p-[15px_20px]">
                                    <div className="flex flex-col">
                                        <strong className="text-white text-[1rem]">{item.name}</strong>
                                        <span className="text-primary text-[0.85rem] font-bold">{item.phone}</span>
                                    </div>
                                </td>
                                <td className="p-[15px_20px] text-white font-semibold">
                                    {item.membership_type_name || 'Не вказано'}
                                </td>
                                <td className="p-[15px_20px]">
                                    {getStatusBadge(item.status)}
                                </td>
                                <td className="p-[15px_20px]">
                                    <div className="flex gap-[12px] justify-end">
                                        <button 
                                            title="Обробити заявку" 
                                            onClick={() => handleEdit(item)}
                                            disabled={isSubmitting}
                                            className="w-[32px] h-[32px] rounded-md bg-[#222] text-[#aaa] flex items-center justify-center transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
                                        >
                                            <i className="fas fa-pen"></i>
                                        </button>
                                        <button 
                                            title="Видалити" 
                                            onClick={() => handleDelete(item.id)} 
                                            disabled={isSubmitting}
                                            className="w-[32px] h-[32px] rounded-md bg-primary/10 border border-primary/20 text-primary flex items-center justify-center transition-colors hover:bg-primary/20 hover:text-[#ff1a1a] disabled:opacity-50"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="text-center text-[#666] p-[40px] font-medium">
                                    Нових заявок ще немає.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <AdminModal 
                isOpen={isModalOpen} 
                onClose={() => !isSubmitting && setIsModalOpen(false)} 
                title="Обробка заявки"
            >
                <form className="flex flex-col gap-5" onSubmit={handleSave}>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl mb-2">
                        <p className="m-0 text-[#aaa] text-sm mb-1">Клієнт: <strong className="text-white text-base">{formData.name}</strong></p>
                        <p className="m-0 text-[#aaa] text-sm mb-1">Телефон: <strong className="text-primary text-base">{formData.phone}</strong></p>
                        <p className="m-0 text-[#aaa] text-sm">Цікавить: <strong className="text-white text-base">{formData.membership_type_name}</strong></p>
                    </div>

                    <div>
                        <label className="block mb-2 text-[0.8rem] font-bold text-[#888] uppercase tracking-wide">Статус заявки</label>
                        <select 
                            name="status" 
                            value={formData.status || 'new'} 
                            onChange={(e) => setFormData({...formData, status: e.target.value})} 
                            disabled={isSubmitting} 
                            className={inputClasses}
                        >
                            <option value="new">Нова (Не оброблено)</option>
                            <option value="in_progress">В роботі (Думає)</option>
                            <option value="completed">Успішно продано</option>
                            <option value="cancelled">Відмова</option>
                        </select>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row justify-end gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="w-full sm:w-auto px-[25px] py-[14px] bg-transparent border border-[#444] text-[#aaa] rounded-lg font-bold uppercase tracking-wide transition-colors hover:border-white hover:text-white disabled:opacity-50">
                            Скасувати
                        </button>
                        <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-[25px] py-[14px] bg-primary text-white rounded-lg font-extrabold uppercase tracking-wide shadow-[0_4px_15px_rgba(255,0,0,0.3)] transition-all hover:-translate-y-0.5 hover:bg-[#cc0000] disabled:opacity-50 flex items-center justify-center gap-2">
                            <i className={isSubmitting ? "fas fa-spinner fa-spin" : "fas fa-check"}></i> 
                            {isSubmitting ? 'ЗБЕРЕЖЕННЯ...' : 'ЗБЕРЕГТИ СТАТУС'}
                        </button>
                    </div>
                </form>
            </AdminModal>
        </div>
    );
}