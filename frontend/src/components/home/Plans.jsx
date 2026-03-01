import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { usePublicData, useFitMutation } from '../../hooks/useFitQuery';
import { useUI } from '../../context/UIContext';

// === КОМПОНЕНТ МОДАЛОЧКИ ДЛЯ ЗАЯВКИ ===
const Modal = ({ isOpen, onClose, selectedPlan }) => {
    const { addToast } = useUI();
    const applyMutation = useFitMutation('POST');
    
    // Стейт для полів форми
    const [formData, setFormData] = useState({ name: '', phone: '' });

    if (!isOpen || !selectedPlan) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Відправляємо дані на наш новий ендпоінт
        applyMutation.mutate(
            { 
                endpoint: '/api/apply/', 
                data: {
                    name: formData.name,
                    phone: formData.phone,
                    membership_type: selectedPlan.id
                } 
            },
            {
                onSuccess: () => {
                    addToast('Заявку успішно відправлено! Ми вам зателефонуємо.', 'success');
                    setFormData({ name: '', phone: '' }); // Очищаємо форму
                    onClose(); // Закриваємо модалку
                },
                onError: (error) => {
                    addToast(error.message || 'Помилка відправки заявки', 'error');
                }
            }
        );
    };

    return createPortal(
        <div className="fixed inset-0 w-screen h-screen bg-black/60 backdrop-blur-sm flex justify-center items-center z-[1000] animate-fadeIn" onClick={onClose}>
            <div className="bg-[#141414] border border-[#333] border-t-4 border-t-primary p-[30px] rounded-2xl w-[90%] max-w-[350px] text-white text-center relative shadow-[0_25px_60px_rgba(0,0,0,0.8)] animate-popIn" onClick={(e) => e.stopPropagation()}>
                <button 
                    className="absolute top-2.5 right-4 bg-transparent border-none text-[#888] text-2xl cursor-pointer hover:text-white transition-colors" 
                    onClick={onClose}
                    disabled={applyMutation.isPending}
                >
                    &times;
                </button>
                <h3 className="text-[1.2rem] uppercase mb-1.5 font-extrabold tracking-wide">Оформити підписку</h3>
                <p className="text-[0.9rem] mb-5 text-[#aaa]">Тариф: <span className="text-primary font-bold">{selectedPlan.name}</span></p>
                
                <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                    <input 
                        className="p-3 bg-white/5 border border-[#333] rounded-lg text-white text-[0.9rem] outline-none focus:border-primary transition-colors placeholder-[#666]" 
                        type="text" 
                        placeholder="Ваше ім'я" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required 
                        disabled={applyMutation.isPending}
                    />
                    <input 
                        className="p-3 bg-white/5 border border-[#333] rounded-lg text-white text-[0.9rem] outline-none focus:border-primary transition-colors placeholder-[#666]" 
                        type="tel" 
                        placeholder="Ваш телефон (+380...)" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required 
                        disabled={applyMutation.isPending}
                    />
                    <button 
                        type="submit" 
                        className="w-full p-3 bg-primary hover:bg-[#cc0000] text-white border-none rounded-lg font-bold uppercase cursor-pointer transition-colors duration-300 text-[0.85rem] mt-2 shadow-[0_4px_15px_rgba(255,0,0,0.3)] disabled:opacity-50"
                        disabled={applyMutation.isPending}
                    >
                        {applyMutation.isPending ? 'ВІДПРАВКА...' : 'ЗАМОВИТИ'}
                    </button>
                </form>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.3s ease forwards; }
                @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-popIn { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
            `}</style>
        </div>,
        document.body
    );
};

// === КАРТКА ТАРИФУ ===
const PlanCard = ({ title, price, features, isFeatured, onSelect }) => (
    <div className={`bg-white px-5 py-[25px] rounded-xl text-center transition-transform duration-300 relative flex flex-col hover:-translate-y-1.5 ${isFeatured ? 'border-2 border-primary scale-105 z-10 shadow-[0_15px_30px_rgba(255,0,0,0.15)]' : 'shadow-[0_5px_20px_rgba(0,0,0,0.1)]'}`}>
        {isFeatured && <div className="absolute -top-2.5 right-4 bg-primary text-white px-2.5 py-0.5 rounded text-[0.7rem] font-bold uppercase tracking-wider">Top</div>}
        <h3 className="text-[1.2rem] font-bold text-[#333] mb-2.5">{title}</h3>
        <div className="text-[2.2rem] font-extrabold text-primary mb-[15px]">
            <span className="text-[1rem] align-super">₴</span>{Number(price)}<span className="text-[0.8rem] text-[#888] font-normal">/міс</span>
        </div>
        <ul className="list-none p-0 mb-5 text-left flex-1">
            {features.map((f, i) => (
                <li key={i} className="text-[0.85rem] text-[#555] mb-2 font-semibold">
                    <span className="text-primary mr-2 font-bold">✓</span> {f}
                </li>
            ))}
        </ul>
        <button 
            className={`w-full p-2.5 text-white border-none rounded-md font-bold uppercase cursor-pointer transition-colors duration-300 text-[0.85rem] mt-auto ${isFeatured ? 'bg-primary hover:bg-[#cc0000]' : 'bg-black hover:bg-primary'}`} 
            onClick={onSelect}
        >
            Обрати
        </button>
    </div>
);

// === ГОЛОВНИЙ КОМПОНЕНТ ===
export default function Plans() {
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

    // Витягуємо тарифи з бекенду
    const { data: plans = [], isLoading } = usePublicData('plans', '/api/membership-types/');

    const handlePlanSelect = (plan) => {
        setSelectedPlan(plan);
        setModalOpen(true);
    };

    return (
        <section id="plans" className="relative py-[60px] bg-[url('https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070')] bg-center bg-cover bg-fixed min-h-[600px] flex items-center">
            {/* Затемнення фону */}
            <div className="absolute inset-0 bg-black/85 z-[1]"></div>
            
            <div className="container mx-auto relative z-[2] max-w-[1000px] px-[15px] w-full">
                <div className="text-center mb-10 text-white">
                    <h2 className="text-[2.2rem] font-extrabold uppercase tracking-wide">Наші <span className="text-primary">Тарифи</span></h2>
                </div>
                
                {isLoading ? (
                    <div className="text-center text-white font-bold text-xl animate-pulse">
                        Завантаження тарифів...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5 items-center justify-center">
                        {plans.length > 0 ? plans.map((plan, index) => {
                            // Розбиваємо опис з адмінки на масив фіч (по комі або новому рядку)
                            const features = plan.description 
                                ? plan.description.split(/[,;\n]+/).map(f => f.trim()).filter(Boolean) 
                                : ["Стандартний доступ"];
                            
                            // Робимо центральну картку (або другу по рахунку) виділеною (Top)
                            const isFeatured = index === 1;

                            return (
                                <PlanCard 
                                    key={plan.id}
                                    title={plan.name} 
                                    price={plan.amount} 
                                    features={features}
                                    isFeatured={isFeatured} 
                                    onSelect={() => handlePlanSelect(plan)} 
                                />
                            );
                        }) : (
                            <div className="text-center text-white col-span-full">Тарифи ще не додані.</div>
                        )}
                    </div>
                )}
            </div>
            
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setModalOpen(false)} 
                selectedPlan={selectedPlan} 
            />
        </section>
    );
}