import React, { useState } from 'react';
import { CreditCard, Crown, Loader2 } from 'lucide-react';
import SlideOverModal from '../ui/SlideOverModal';
import { cn } from '../../lib/utils';
import { useUI } from '../../context/UIContext';

export default function MembershipSaleModal({ isOpen, onClose, client, onSuccess }) {
    const { addToast } = useUI();
    const [selectedPlan, setSelectedPlan] = useState('Basic');
    const [isSelling, setIsSelling] = useState(false);

    if (!client) return null;

    const getDisplayName = (item) => {
        if (item.full_name) return item.full_name;
        const firstLast = `${item.first_name || ''} ${item.last_name || ''}`.trim();
        return firstLast || item.username || 'Невідомий';
    };

    const submitSellPlan = (e) => {
        e.preventDefault();
        setIsSelling(true);

        // Mocking API delay
        setTimeout(() => {
            setIsSelling(false);
            addToast(`План "${selectedPlan}" успішно продано клієнту ${getDisplayName(client)}!`, 'success');
            onSuccess(); // Close modal and potentially force refetch
        }, 1200);
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
                    <div className="grid grid-cols-1 gap-3">
                        {['Basic', 'Pro', 'Unlimited'].map((plan) => (
                            <div
                                key={plan}
                                onClick={() => !isSelling && setSelectedPlan(plan)}
                                className={cn(
                                    "cursor-pointer rounded-xl border p-4 transition-all duration-300 flex items-center justify-between group",
                                    selectedPlan === plan
                                        ? "border-primary bg-gradient-to-r from-primary/10 to-transparent shadow-[0_0_20px_rgba(255,0,0,0.15)]"
                                        : "border-[#222] bg-[#141414] hover:border-[#444] hover:bg-white/5"
                                )}
                            >
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={cn(
                                            "font-black uppercase tracking-wider text-sm transition-colors",
                                            selectedPlan === plan ? "text-primary" : "text-[#aaaaaa] group-hover:text-[#ffffff]"
                                        )}>
                                            {plan}
                                        </div>
                                        {plan === 'Unlimited' && <Crown className={cn("w-3.5 h-3.5", selectedPlan === plan ? "text-primary" : "text-[#aaaaaa]")} />}
                                    </div>
                                    <div className="text-xs text-[#888888] font-semibold">
                                        {plan === 'Basic' && '8 занять / міс.'}
                                        {plan === 'Pro' && '12 занять / міс.'}
                                        {plan === 'Unlimited' && 'Безліміт на всі зони'}
                                    </div>
                                </div>
                                <div className={cn(
                                    "font-black text-xl transition-colors",
                                    selectedPlan === plan ? "text-[#ffffff]" : "text-[#888888] group-hover:text-[#ffffff]"
                                )}>
                                    {plan === 'Basic' && '800 ₴'}
                                    {plan === 'Pro' && '1200 ₴'}
                                    {plan === 'Unlimited' && '2500 ₴'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-4 flex flex-col gap-3 mt-auto">
                    <button
                        type="submit"
                        disabled={isSelling}
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
