import React, { useState } from 'react';
import { createPortal } from 'react-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { usePublicData, useFitMutation } from '../../hooks/useFitQuery';
import { useUI } from '../../context/UIContext';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1, y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
};

const staggerContainer = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.15 }
    }
};

const Modal = ({ isOpen, onClose, selectedPlan }) => {
    const { addToast } = useUI();
    const applyMutation = useFitMutation('POST');
    const [formData, setFormData] = useState({ name: '', phone: '' });

    if (!isOpen || !selectedPlan) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        applyMutation.mutate(
            { endpoint: '/api/apply/', data: { name: formData.name, phone: formData.phone, membership_type: selectedPlan.id } },
            {
                onSuccess: () => { addToast('Заявку відправлено! Ми вам зателефонуємо.', 'success'); setFormData({ name: '', phone: '' }); onClose(); },
                onError: (err) => addToast(err.message || 'Помилка відправки', 'error'),
            }
        );
    };

    return createPortal(
        <div className="fixed inset-0 w-screen h-screen bg-black/70 backdrop-blur-md flex justify-center items-center z-[1000]" onClick={onClose}>
            <motion.div
                className="glass-card border-t-2 border-t-primary p-8 w-[90%] max-w-[380px] text-white text-center relative shadow-[0_25px_60px_rgba(0,0,0,0.8)]"
                onClick={e => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
            >
                <button className="absolute top-3 right-4 text-white/30 hover:text-white text-2xl transition-colors" onClick={onClose} disabled={applyMutation.isPending}>&times;</button>
                <h3 className="font-heading text-xl uppercase tracking-widest mb-1">Оформити підписку</h3>
                <p className="text-white/50 text-sm mb-6">Тариф: <span className="text-primary font-semibold">{selectedPlan.name}</span></p>
                <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                    <input className="p-3 bg-white/5 border border-white/10 rounded-btn text-white text-sm outline-none focus:border-primary transition-colors placeholder-white/30 font-body" type="text" placeholder="Ваше ім'я" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required disabled={applyMutation.isPending} />
                    <input className="p-3 bg-white/5 border border-white/10 rounded-btn text-white text-sm outline-none focus:border-primary transition-colors placeholder-white/30 font-body" type="tel" placeholder="+380..." value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required disabled={applyMutation.isPending} />
                    <button type="submit" className="btn-primary w-full p-3 text-white rounded-btn font-heading font-semibold uppercase tracking-widest text-sm mt-2 disabled:opacity-50" disabled={applyMutation.isPending}>
                        {applyMutation.isPending ? 'Відправка...' : 'Замовити'}
                    </button>
                </form>
            </motion.div>
        </div>,
        document.body
    );
};

const PlanCard = ({ title, price, features, isFeatured, period, onSelect, index }) => (
    <motion.div
        custom={index}
        variants={fadeInUp}
        whileHover={{ y: -6, transition: { duration: 0.25 } }}
        className={`relative flex flex-col rounded-card p-7 transition-all duration-300 cursor-default
            ${isFeatured
                ? 'bg-white/5 border border-primary/50 scale-105 z-10'
                : 'glass-card hover:border-white/15'
            }`}
        style={isFeatured ? { boxShadow: 'var(--glow-red)' } : undefined}
    >
        {isFeatured && (
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-badge text-[0.65rem] font-heading font-semibold uppercase tracking-[2px]">
                Популярний
            </div>
        )}

        {/* Plan name */}
        <div className="mb-4">
            <h3 className="font-heading text-lg font-semibold uppercase tracking-widest text-white/80">{title}</h3>
            <div className="h-[2px] w-10 bg-primary mt-2 rounded-full" />
        </div>

        {/* Price */}
        <div className="mb-6">
            <div className="flex items-end gap-1">
                <span className="font-body text-white/40 text-sm self-start mt-2">₴</span>
                <span className="font-display text-[3.5rem] text-white leading-none">{Number(price)}</span>
            </div>
            <span className="font-body text-white/30 text-xs uppercase tracking-widest">за {period || 1} міс.</span>
        </div>

        {/* Features */}
        <ul className="flex-1 flex flex-col gap-2.5 mb-8">
            {features.map((f, i) => (
                <motion.li
                    key={i}
                    className="flex items-start gap-2.5 text-sm font-body text-white/60"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
                >
                    <span className="text-primary mt-0.5 shrink-0">✓</span>
                    <span>{f}</span>
                </motion.li>
            ))}
        </ul>

        <button
            onClick={onSelect}
            className={`w-full py-3 rounded-btn font-heading font-semibold uppercase tracking-[2px] text-sm transition-all duration-300
                ${isFeatured
                    ? 'btn-primary text-white'
                    : 'border border-white/15 text-white/70 hover:border-primary hover:text-white hover:bg-primary/10'
                }`}
        >
            Обрати план
        </button>
    </motion.div>
);

export default function Plans() {
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const { data: plans = [], isLoading } = usePublicData('plans', '/api/membership-types/');

    return (
        <section id="plans" className="relative py-24 bg-background overflow-hidden">
            {/* Subtle bg texture */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/3 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto relative z-10 max-w-[1100px] px-5">
                {/* Heading */}
                <motion.div
                    className="text-center mb-14"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="font-heading text-primary text-xs uppercase tracking-[4px]">Членство</span>
                    <h2 className="font-display text-[clamp(2.5rem,6vw,4rem)] text-white uppercase tracking-wide mt-2">
                        Наші <span className="text-gradient-red">Тарифи</span>
                    </h2>
                    <p className="font-body text-white/40 mt-3 max-w-md mx-auto text-sm">
                        Оберіть план який підходить саме вам. Без прихованих платежів.
                    </p>
                </motion.div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1,2,3].map(i => <div key={i} className="glass-card h-[420px] animate-pulse" />)}
                    </div>
                ) : plans.length > 0 ? (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        {plans.map((plan, index) => {
                            const features = plan.description
                                ? plan.description.split(/[,;\n]+/).map(f => f.trim()).filter(Boolean)
                                : ['Стандартний доступ'];
                            return (
                                <PlanCard
                                    key={plan.id}
                                    title={plan.name}
                                    price={plan.amount}
                                    period={plan.period_months}
                                    features={features}
                                    isFeatured={index === 1}
                                    index={index}
                                    onSelect={() => { setSelectedPlan(plan); setModalOpen(true); }}
                                />
                            );
                        })}
                    </motion.div>
                ) : (
                    <div className="text-center font-body text-white/30 py-20">Тарифи ще не додані.</div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} selectedPlan={selectedPlan} />
        </section>
    );
}
