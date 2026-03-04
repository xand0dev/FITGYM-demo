import { useState } from 'react';
import AdminModal from './AdminModal';
import { useFitMutation } from '../../hooks/useFitQuery';
import { useUI } from '../../context/UIContext';
import { cn } from '../../lib/utils';
import { Plus, Edit, Trash2, CreditCard, Check, Loader2, Crown, X } from 'lucide-react';

export default function DataTableTab({ data, tabType, onRefresh }) {
    const { addToast } = useUI();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [formData, setFormData] = useState({});

    // Sell Plan State Modal
    const [isSellModalOpen, setIsSellModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState('Basic');
    const [isSelling, setIsSelling] = useState(false);

    const isTrainer = tabType === 'trainers';
    const isClient = tabType === 'clients';
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
                onError: (e) => addToast('Не вдалося видалити: ' + e.message, 'error')
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
                onError: (e) => addToast('Помилка збереження: ' + e.message, 'error')
            }
        );
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSellPlanClick = (client) => {
        setSelectedClient(client);
        setSelectedPlan('Basic');
        setIsSellModalOpen(true);
    };

    const submitSellPlan = (e) => {
        e.preventDefault();
        setIsSelling(true);
        // Mocking API delay
        setTimeout(() => {
            setIsSelling(false);
            setIsSellModalOpen(false);
            addToast(`План "${selectedPlan}" успішно продано клієнту ${getDisplayName(selectedClient)}!`, 'success');
        }, 1200);
    };

    const getDisplayName = (item) => {
        if (item.full_name) return item.full_name;
        const firstLast = `${item.first_name || ''} ${item.last_name || ''}`.trim();
        return firstLast || item.username || 'Невідомий';
    };

    const inputClasses = cn(
        "w-full p-3.5 rounded-lg border text-[#ffffff] font-semibold outline-none transition-all duration-300 disabled:opacity-50",
        "bg-[#141414] border-[#222] focus:border-primary focus:shadow-[0_0_10px_rgba(255,0,0,0.2)]"
    );
    const labelClasses = "block mb-2 text-xs font-black text-[#aaaaaa] uppercase tracking-wider";

    return (
        <div className="animate-fade-in space-y-6">
            {/* ШАПКА ТАБЛИЦІ З КНОПКОЮ "ДОДАТИ" */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h3 className="text-xl font-black uppercase tracking-wider text-[#ffffff] flex items-center gap-2">
                    Довідник: <span className="text-primary">{title}</span>
                </h3>
                <button
                    onClick={handleAddNew}
                    className="px-5 py-2.5 rounded-lg bg-primary text-white font-black text-sm flex items-center justify-center gap-2 uppercase tracking-wide transition-all duration-300 hover:bg-[#cc0000] hover:-translate-y-0.5 shadow-[0_4px_15px_rgba(255,0,0,0.3)] disabled:opacity-50"
                >
                    <Plus className="w-4 h-4" />
                    <span>Додати запис</span>
                </button>
            </div>

            {/* ТАБЛИЦЯ */}
            <div className="w-full overflow-x-auto rounded-xl border border-[#222] bg-[#141414]/60 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.4)] custom-scrollbar">
                <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
                    <thead>
                        <tr className="border-b border-[#222] bg-[#0a0a0a]">
                            <th className="p-4 text-xs font-black text-[#aaaaaa] uppercase tracking-wider">Користувач</th>
                            <th className="p-4 text-xs font-black text-[#aaaaaa] uppercase tracking-wider">{isTrainer ? 'Спеціалізація' : 'Контакти (Email)'}</th>
                            <th className="p-4 text-xs font-black text-[#aaaaaa] uppercase tracking-wider">Роль</th>

                            {/* Membership column exclusively for clients */}
                            {isClient && (
                                <th className="p-4 text-xs font-black text-[#aaaaaa] uppercase tracking-wider">Абонемент</th>
                            )}

                            <th className="p-4 text-xs font-black text-[#aaaaaa] uppercase tracking-wider text-right">Дії</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data && data.length > 0 ? data.map(item => (
                            <tr key={item.id} className="border-b border-[#222] transition-colors duration-200 hover:bg-white/5 last:border-none">
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
                                        {isTrainer ? (item.specialties || '—') : (item.email || '—')}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className="inline-block bg-[#141414] text-[#ffffff] border border-[#222] px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider">
                                        {isTrainer ? 'Тренер' : 'Клієнт'}
                                    </span>
                                </td>

                                {/* Placeholder Badge for Client Membership */}
                                {isClient && (
                                    <td className="p-4">
                                        {item.id % 2 === 0 ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-green-500 bg-green-500/10">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]"></div>
                                                Активний
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-[#aaaaaa] bg-white/5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#aaaaaa]"></div>
                                                Немає
                                            </span>
                                        )}
                                    </td>
                                )}

                                <td className="p-4">
                                    <div className="flex gap-2 justify-end">
                                        {isClient && (
                                            <button
                                                title="Продати абонемент"
                                                onClick={() => handleSellPlanClick(item)}
                                                disabled={isDeleting}
                                                className="px-3 h-9 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center gap-2 transition-colors hover:bg-primary hover:text-white disabled:opacity-50 text-xs font-black uppercase tracking-wider"
                                            >
                                                <CreditCard className="w-4 h-4" />
                                                Продати
                                            </button>
                                        )}
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
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={isClient ? "5" : "4"} className="text-center text-[#aaaaaa] p-10 font-bold">
                                    Дані відсутні. Натисніть "Додати запис".
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* УНІВЕРСАЛЬНА МОДАЛКА СТВОРЕННЯ/РЕДАГУВАННЯ */}
            <AdminModal
                isOpen={isModalOpen}
                onClose={() => !isSubmitting && setIsModalOpen(false)}
                title={modalMode === 'create' ? `Новий ${isTrainer ? 'тренер' : 'клієнт'}` : `Редагування`}
            >
                <form className="flex flex-col gap-6" onSubmit={handleSave}>
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
                            {modalMode === 'create' && (
                                <div>
                                    <label className={labelClasses}>Пароль</label>
                                    <input type="password" name="password" value={formData.password || ''} onChange={handleChange} required minLength="6" disabled={isSubmitting} className={inputClasses} />
                                </div>
                            )}
                        </>
                    )}

                    <div className="pt-2 flex flex-col sm:flex-row justify-end gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="w-full sm:w-auto px-6 py-3 rounded-lg border border-[#222] text-[#aaaaaa] font-black uppercase tracking-wider transition-colors hover:bg-white/5 hover:text-[#ffffff] disabled:opacity-50">
                            Скасувати
                        </button>
                        <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-6 py-3 rounded-lg bg-primary text-white font-black uppercase tracking-wider shadow-[0_4px_15px_rgba(255,0,0,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,0,0,0.5)] hover:bg-[#cc0000] disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2">
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                            {isSubmitting ? 'ОБРОБКА...' : 'ЗБЕРЕГТИ'}
                        </button>
                    </div>
                </form>
            </AdminModal>

            {/* SELL PLAN MODAL (SLIDE-OVER STYLE IF NEEDED, BUT KEEPING STANDARD MODAL FOR CONSISTENCY) */}
            <AdminModal
                isOpen={isSellModalOpen}
                onClose={() => !isSelling && setIsSellModalOpen(false)}
                title="Оформлення абонемента"
            >
                {selectedClient && (
                    <form onSubmit={submitSellPlan} className="flex flex-col gap-6">
                        <div className="p-4 rounded-xl bg-[#141414] border border-[#222] flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/20 text-primary flex items-center justify-center rounded-lg font-black text-xl">
                                {getDisplayName(selectedClient).charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-wider text-[#aaaaaa]">Клієнт</p>
                                <p className="text-lg font-extrabold text-[#ffffff]">{getDisplayName(selectedClient)}</p>
                            </div>
                        </div>

                        <div>
                            <label className={labelClasses}>Оберіть тарифний план</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {['Basic', 'Pro', 'Unlimited'].map((plan) => (
                                    <div
                                        key={plan}
                                        onClick={() => !isSelling && setSelectedPlan(plan)}
                                        className={cn(
                                            "cursor-pointer rounded-xl border p-4 transition-all duration-200 text-center",
                                            selectedPlan === plan
                                                ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(255,0,0,0.2)]"
                                                : "border-[#222] bg-[#141414] hover:border-[#444]"
                                        )}
                                    >
                                        <div className="mb-2">
                                            {plan === 'Basic' && <div className="text-[#aaaaaa] font-black uppercase text-sm">Basic</div>}
                                            {plan === 'Pro' && <div className="text-[#ffffff] font-black uppercase text-sm">Pro</div>}
                                            {plan === 'Unlimited' && <div className="text-primary font-black uppercase text-sm flex items-center justify-center gap-1"><Crown className="w-3 h-3" /> Unlimited</div>}
                                        </div>
                                        <div className="font-extrabold text-lg text-[#ffffff]">
                                            {plan === 'Basic' && '800 ₴'}
                                            {plan === 'Pro' && '1200 ₴'}
                                            {plan === 'Unlimited' && '2500 ₴'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-2 flex flex-col sm:flex-row justify-end gap-3">
                            <button type="button" onClick={() => setIsSellModalOpen(false)} disabled={isSelling} className="w-full sm:w-auto px-6 py-3 rounded-lg border border-[#222] text-[#aaaaaa] font-black uppercase tracking-wider transition-colors hover:bg-white/5 hover:text-[#ffffff] disabled:opacity-50">
                                Скасувати
                            </button>
                            <button type="submit" disabled={isSelling} className="w-full sm:w-auto px-6 py-3 rounded-lg bg-green-500 text-white font-black uppercase tracking-wider shadow-[0_4px_15px_rgba(34,197,94,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(34,197,94,0.5)] hover:bg-green-600 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2">
                                {isSelling ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                                {isSelling ? 'ОФОРМЛЕННЯ...' : 'ПРОДАТИ'}
                            </button>
                        </div>
                    </form>
                )}
            </AdminModal>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 6px; }
            `}</style>
        </div>
    );
}