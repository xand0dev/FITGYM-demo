import React, { useState } from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ isOpen, onClose, planTitle }) => {
    if (!isOpen) return null;
    
    return createPortal(
        <div className="fixed inset-0 w-screen h-screen bg-black/60 backdrop-blur-sm flex justify-center items-center z-[1000]" onClick={onClose}>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-[30px] rounded-2xl w-[90%] max-w-[320px] text-white text-center relative" onClick={(e) => e.stopPropagation()}>
                <button className="absolute top-2.5 right-4 bg-transparent border-none text-white text-2xl cursor-pointer hover:text-primary transition-colors" onClick={onClose}>&times;</button>
                <h3 className="text-[1.2rem] uppercase mb-1.5 font-bold">Оформити підписку</h3>
                <p className="text-[0.9rem] mb-5">Тариф: <span className="text-primary font-bold">{planTitle}</span></p>
                <form className="flex flex-col gap-2.5" onSubmit={(e) => e.preventDefault()}>
                    <input className="p-2.5 bg-white/10 border border-white/30 rounded-lg text-white text-[0.9rem] outline-none focus:border-primary transition-colors placeholder-white/50" type="text" placeholder="Ім'я" required />
                    <input className="p-2.5 bg-white/10 border border-white/30 rounded-lg text-white text-[0.9rem] outline-none focus:border-primary transition-colors placeholder-white/50" type="tel" placeholder="Телефон" required />
                    <button type="submit" className="w-full p-2.5 bg-primary hover:bg-[#cc0000] text-white border-none rounded-md font-bold uppercase cursor-pointer transition-colors duration-300 text-[0.85rem] mt-2 shadow-[0_4px_10px_rgba(255,0,0,0.3)]">Замовити</button>
                </form>
            </div>
        </div>,
        document.body
    );
};

const PlanCard = ({ title, price, features, isFeatured, onSelect }) => (
    <div className={`bg-white px-5 py-[25px] rounded-xl text-center transition-transform duration-300 relative flex flex-col hover:-translate-y-1.5 ${isFeatured ? 'border-2 border-primary scale-105 z-10 shadow-[0_15px_30px_rgba(255,0,0,0.15)]' : 'shadow-[0_5px_20px_rgba(0,0,0,0.1)]'}`}>
        {isFeatured && <div className="absolute -top-2.5 right-4 bg-primary text-white px-2.5 py-0.5 rounded text-[0.7rem] font-bold uppercase tracking-wider">Top</div>}
        <h3 className="text-[1.2rem] font-bold text-[#333] mb-2.5">{title}</h3>
        <div className="text-[2.2rem] font-extrabold text-primary mb-[15px]">
            <span className="text-[1rem] align-super">₴</span>{price}<span className="text-[0.8rem] text-[#888] font-normal">/міс</span>
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
            onClick={() => onSelect(title)}
        >
            Обрати
        </button>
    </div>
);

export default function Plans() {
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('');

    const handlePlanSelect = (title) => {
        setSelectedPlan(title);
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
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
                    <PlanCard title="Базовий" price="800" features={["8 тренувань", "Кардіо зона", "Душ"]} onSelect={handlePlanSelect} />
                    <PlanCard title="Безліміт" price="1200" isFeatured features={["Безліміт", "Всі зони", "24/7"]} onSelect={handlePlanSelect} />
                    <PlanCard title="PRO" price="2500" features={["Персональний план", "Заморозка", "Пріоритет"]} onSelect={handlePlanSelect} />
                </div>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} planTitle={selectedPlan} />
        </section>
    );
}