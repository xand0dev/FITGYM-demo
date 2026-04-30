import React, { useState } from 'react';
import { useFitMutation } from '../../hooks/useFitQuery';
import { useUI } from '../../context/UIContext';
import { Plus, Edit, Trash2, CreditCard, Loader2 } from 'lucide-react';
import PremiumTable from '../ui/PremiumTable';
import MembershipSaleModal from './MembershipSaleModal';

export default function ClientsTab({ data, onRefresh, isLoading = false }) {
    const { addToast } = useUI();
    const [isSellModalOpen, setIsSellModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

    const deleteMutation = useFitMutation('DELETE');
    const isDeleting = deleteMutation.isPending;

    const handleSellPlanClick = (client) => {
        setSelectedClient(client);
        setIsSellModalOpen(true);
    };

    const handleDelete = (id) => {
        if (!window.confirm(`Ви впевнені, що хочете видалити цього клієнта?`)) return;

        deleteMutation.mutate(
            { endpoint: `/api/admin/members/${id}/`, data: null },
            {
                onSuccess: () => { if (onRefresh) onRefresh(); },
                onError: (e) => addToast('Не вдалося видалити: ' + e.message, 'error')
            }
        );
    };

    const handleEdit = (item) => {
        // Todo: Integrate standard Edit Modal later or navigate to a specialized Client Editor Page
        addToast("Редагування клієнта тимчасово недоступне. (У розробці)", 'info');
    };

    const getDisplayName = (item) => {
        if (item.full_name) return item.full_name;
        const firstLast = `${item.first_name || ''} ${item.last_name || ''}`.trim();
        return firstLast || item.username || 'Невідомий';
    };

    const columns = [
        { label: 'Клієнт', className: '' },
        { label: 'Контакти (Email)', className: '' },
        { label: 'Роль', className: '' },
        { label: 'Абонемент', className: 'text-center' },
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
                    {item.email || '—'}
                </span>
            </td>
            <td className="p-4">
                <span className="inline-block bg-[#141414] text-[#ffffff] border border-[#222] px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider">
                    Клієнт
                </span>
            </td>
            <td className="p-4 text-center">
                {item.active_membership ? (
                    <div className="flex flex-col items-center gap-1">
                        <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-green-500 bg-green-500/10 border border-green-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]"></div>
                            Активний
                        </span>
                        <span className="text-[10px] text-[#666] font-semibold">
                            {item.active_membership.name}
                        </span>
                        <span className="text-[10px] text-[#555]">
                            до {item.active_membership.end_date}
                        </span>
                    </div>
                ) : (
                    <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-[#aaaaaa] bg-white/5 border border-white/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#aaaaaa]"></div>
                        Немає
                    </span>
                )}
            </td>
            <td className="p-4">
                <div className="flex gap-2 justify-end">
                    <button
                        title="Продати абонемент"
                        onClick={() => handleSellPlanClick(item)}
                        disabled={isDeleting}
                        className="px-4 h-[38px] rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center gap-2 transition-all duration-300 hover:bg-primary hover:text-white hover:shadow-[0_4px_15px_rgba(255,0,0,0.3)] disabled:opacity-50 text-xs font-black uppercase tracking-wider"
                    >
                        <CreditCard className="w-4 h-4" />
                        Продати
                    </button>
                    <button
                        title="Редагувати"
                        onClick={() => handleEdit(item)}
                        disabled={isDeleting}
                        className="w-[38px] h-[38px] rounded-lg bg-white/5 border border-transparent text-[#aaaaaa] flex items-center justify-center transition-colors hover:bg-[#333] hover:text-[#ffffff] disabled:opacity-50"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        title="Видалити"
                        onClick={() => handleDelete(item.id)}
                        disabled={isDeleting}
                        className="w-[38px] h-[38px] rounded-lg bg-red-500/10 border border-transparent text-red-500 flex items-center justify-center transition-colors hover:bg-red-500/20 hover:border-red-500/30 disabled:opacity-50"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </>
    );

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
                    Довідник: <span className="text-primary">Клієнти</span>
                </h3>
                <button
                    onClick={() => handleEdit(null)} // Hook up real create modal later
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
                emptyMessage="Клієнтів не знайдено."
            />

            {/* Slide-over sales interface */}
            <MembershipSaleModal
                isOpen={isSellModalOpen}
                onClose={() => setIsSellModalOpen(false)}
                client={selectedClient}
                onSuccess={() => {
                    setIsSellModalOpen(false);
                    if (onRefresh) onRefresh();
                }}
            />
        </div>
    );
}
