import React, { useState } from 'react';
import { createPortal } from 'react-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1, y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
};

const CategoryCard = ({ title, img, isLarge, isTall, onClick }) => (
    <motion.div
        variants={fadeInUp}
        whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
        className={`group relative overflow-hidden rounded-card border border-white/10 bg-surface h-full min-h-[220px] md:min-h-[240px] cursor-pointer transition-all duration-300 hover:border-primary/40 ${isLarge ? 'md:col-span-2' : 'col-span-1'} ${isTall ? 'md:row-span-2' : 'row-span-1'}`}
        onClick={onClick}
    >
        <img src={img} alt={title} className="w-full h-full object-cover grayscale brightness-50 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:grayscale-0 group-hover:brightness-60 group-hover:scale-105" />

        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center transition-all duration-400 group-hover:bg-primary/20">
            <h3 className="font-heading text-[clamp(1rem,1.8vw,1.6rem)] font-bold uppercase text-white tracking-[3px] text-center drop-shadow-[2px_2px_4px_rgba(0,0,0,0.5)]">
                {title}
            </h3>
            <div className="w-0 h-[2px] bg-primary mt-3 transition-all duration-500 group-hover:w-[50%] rounded-full"
                 style={{ boxShadow: '0 0 8px rgba(255,0,0,0.4)' }} />
        </div>
    </motion.div>
);

export default function Categories() {
    const [selectedId, setSelectedId] = useState(null);

    const categoriesData = [
        { id: 1, title: "Важка атлетика", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48", isLarge: true, desc: "Робота з вільними вагами для нарощування м'язової маси та сили. Професійні помости та грифи для твого прогресу." },
        { id: 2, title: "Кардіо зона", img: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c", isTall: true, desc: "Сучасні бігові доріжки та еліптичні тренажери для зміцнення серця та спалювання калорій." },
        { id: 3, title: "Йога та Flex", img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b", desc: "Гнучкість, баланс та ментальне здоров'я. Ідеально підходить для відновлення після навантажень." },
        { id: 4, title: "Кросфіт", img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438", desc: "Високоінтенсивні функціональні тренування для справжніх атлетів. Витривалість на межі можливостей." },
        { id: 5, title: "Персональні заняття", img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b", isLarge: true, desc: "Індивідуальний підхід від наших топ-тренерів. Програма, розроблена спеціально під твої цілі." }
    ];

    const current = categoriesData.find(c => c.id === selectedId);

    return (
        <section id="categories" className="py-24 bg-background relative overflow-hidden">
            {/* Subtle bg glow */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/3 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto max-w-[1200px] px-5 md:px-[5%] relative z-10">
                <motion.div
                    className="mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="border-l-[3px] border-primary pl-5">
                        <span className="font-heading text-primary text-xs uppercase tracking-[4px]">Напрямки</span>
                        <h2 className="font-display text-[clamp(2.5rem,6vw,4rem)] text-white uppercase tracking-wide mt-1">
                            ОБЕРИ СВІЙ <span className="text-gradient-red">ШЛЯХ</span>
                        </h2>
                    </div>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] auto-rows-[250px] md:auto-rows-[240px] gap-4"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ staggerChildren: 0.1 }}
                >
                    {categoriesData.map(cat => (
                        <CategoryCard
                            key={cat.id}
                            title={cat.title}
                            img={cat.img}
                            isLarge={cat.isLarge}
                            isTall={cat.isTall}
                            onClick={() => setSelectedId(cat.id)}
                        />
                    ))}
                </motion.div>
            </div>

            {/* FULLSCREEN MODAL */}
            {current && createPortal(
                <motion.div
                    className="fixed inset-0 w-screen h-screen z-[100000] flex items-center justify-center bg-black/95"
                    onClick={() => setSelectedId(null)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Background image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center brightness-[0.15]"
                        style={{ backgroundImage: `url(${current.img})` }}
                    />

                    <motion.div
                        className="relative w-full max-w-[1000px] p-[30px] md:p-[60px] text-white"
                        onClick={e => e.stopPropagation()}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="flex justify-between mb-[50px] md:mb-[100px]">
                            <span className="font-heading text-primary text-xs uppercase tracking-[4px]">FITGYM / КАТЕГОРІЯ</span>
                            <button className="bg-transparent border-none text-white/60 hover:text-white font-heading uppercase tracking-[2px] cursor-pointer transition-colors text-sm" onClick={() => setSelectedId(null)}>ЗАКРИТИ ×</button>
                        </div>

                        <div>
                            <h2 className="font-display text-[clamp(3rem,10vw,7rem)] text-white uppercase mb-6 leading-[0.85]">{current.title}</h2>
                            <p className="font-body text-[1.1rem] max-w-[600px] leading-relaxed text-white/60">{current.desc}</p>
                            <div className="mt-12">
                                <a href="#plans" className="btn-primary inline-block text-white py-4 px-10 rounded-btn font-heading font-semibold uppercase tracking-[2px] text-sm" onClick={() => setSelectedId(null)}>Обрати абонемент →</a>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>,
                document.body
            )}
        </section>
    );
}