import React, { useState } from 'react';
import { CreditCard, Crown, Loader2 } from 'lucide-react';
import SlideOverModal from '../ui/SlideOverModal';
import { cn } from '../../lib/utils';
import { useUI } from '../../context/UIContext';
import { useFitMutation } from '../../hooks/useFitQuery';
import { usePublicData } from '../../hooks/useFitQuery';

export default function MembershipSaleModal({ isOpen, onClose, client, onSuccess }) {
    const { addToast } = useUI();
    const [selectedPlanId, setSelectedPlanId] = useState(null);
    const assignMutation = useFitMutation('POST');

    // Підвантажуємо реальні тарифи з API
    const { data: plans = [], isLoading: plansLoading } = usePublicData('membership-types', '/api/membership-types/');

    if (!client) return null;

    const isSelling = assignMutation.isPending;

    const getDisplayName = (item) => {
        if (item.full_name) return item.full_name;
        const firstLast = `${item.first_name || ''} ${item.last_name || ''}`.trim();
        return firstLast || item.username || 'Невідомий';
    };

    const selectedPlan = plans.find(p => p.id === selectedPlanId);

    const submitSellPlan = (e) => {
        e.preventDefault();
        if (!selectedPlanId) {
            addToast('Оберіть тарифний план', 'error');
            return;
        }

        assignMutation.mutate(
            {
                endpoint: '/api/admin/memberships/assign/',
                data: { member_id: client.id, membership_type_id: selectedPlanId },
            },
            {
                onSuccess: (data) => {
                    addToast(
                        `Абонемент "${selectedPlan?.name}" оформлено до ${data?.end_date || ''}!`,
                        'success'
                    );
                    onSuccess();
                },
                onError: (err) => {
                    const msg = err?.response?.data?.error || err?.message || 'Помилка сервера';
                    addToast(msg, 'error');
                },
            }
        );
    };

    return (
        <SlideOverModal
            isOpen={isOpen}
            onClose={() => !isSelling && onClose()}
            title="Оформлення абонемента"
        >
            <form onSubmit={submitSellPlan} className="flex flex-col gap-6">

                {/* Client Info Card */}
                <div className="p-4 rounded-xl bg-[#141414] border border-[#222] flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/20 text-primary flex items-center justify-center rounded-lg font-black text-xl">
                        {getDisplayName(client).charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-wider text-[#aaaaaa]">Клієнт</p>
                        <p className="text-lg font-extrabold text-[#ffffff]">{getDisplayName(client)}</p>
                    </div>
                </div>

                {/* Plan Selection */}
                <div>
                    <label className="block mb-3 text-xs font-black text-[#aaaaaa] uppercase tracking-wider">
                        Оберіть тарифний план
                    </label>

                    {plansLoading ? (
                        <div className="flex items-center justify-center py-8 text-[#888]">
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Завантаження тарифів...
                        </div>
                    ) : plans.length === 0 ? (
                        <p className="text-[#888] text-sm text-center py-4">Тарифи не знайдено</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {plans.map((plan) => (
                                <div
                                    key={plan.id}
                                    onClick={() => !isSelling && setSelectedPlanId(plan.id)}
                                    className={cn(
                                        "cursor-pointer rounded-xl border p-4 transition-all duration-300 flex items-center justify-between group",
                                        selectedPlanId === plan.id
                                            ? "border-primary bg-gradient-to-r from-primary/10 to-transparent shadow-[0_0_20px_rgba(255,0,0,0.15)]"
                                            : "border-[#222] bg-[#141414] hover:border-[#444] hover:bg-white/5"
                                    )}
                                >
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className={cn(
                                                "font-black uppercase tracking-wider text-sm transition-colors",
                                                selectedPlanId === plan.id ? "text-primary" : "text-[#aaaaaa] group-hover:text-[#ffffff]"
                                            )}>
                                                {plan.name}
                                            </div>
                                            {plan.period_months >= 12 && (
                                                <Crown className={cn("w-3.5 h-3.5", selectedPlanId === plan.id ? "text-primary" : "text-[#aaaaaa]")} />
                                            )}
                                        </div>
                                        <div className="text-xs text-[#888888] font-semibold">
                                            {plan.period_months} міс.
                                            {plan.description ? ` · ${plan.description}` : ''}
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "font-black text-xl transition-colors",
                                        selectedPlanId === plan.id ? "text-[#ffffff]" : "text-[#888888] group-hover:text-[#ffffff]"
                                    )}>
                                        {Number(plan.amount).toLocaleString('uk-UA')} ₴
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="pt-4 flex flex-col gap-3 mt-auto">
                    <button
                        type="submit"
                        disabled={isSelling || !selectedPlanId || plansLoading}
                        className="w-full px-6 py-4 rounded-xl bg-primary text-white font-black uppercase tracking-wider shadow-[0_4px_15px_rgba(255,0,0,0.3)] transition-all duration-300 hover:bg-[#cc0000] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,0,0,0.4)] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
                    >
                        {isSelling ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                        {isSelling ? 'ОБРОБКА...' : 'ОФОРМИТИ АБОНЕМЕНТ'}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSelling}
                        className="w-full px-6 py-4 rounded-xl border border-[#222] bg-transparent text-[#aaaaaa] font-black uppercase tracking-wider transition-all duration-300 hover:bg-white/5 hover:text-[#ffffff] disabled:opacity-50"
                    >
                        Скасувати
                    </button>
                </div>
            </form>
        </SlideOverModal>
    );
}
