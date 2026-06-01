import { useState, useEffect, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

const SLIDES = [
    {
        img: '/img/training_1.jpg',
        title: 'Силові тренування',
        sub: 'Жим, присід, станова — усе під наглядом тренера',
    },
    {
        img: '/img/training_2.jpg',
        title: 'Персональний підхід',
        sub: 'Індивідуальна програма під твої цілі',
    },
    {
        img: '/img/training_3.jpg',
        title: 'Групові заняття',
        sub: 'CrossFit, кардіо, функціональні тренування',
    },
    {
        img: '/img/training_4.jpg',
        title: 'Сучасний простір',
        sub: '1200 м² обладнаного залу',
    },
    {
        img: '/img/training_5.jpg',
        title: 'Результат',
        sub: 'Понад 500 клієнтів вже змінили своє тіло',
    },
];

export default function Hero() {
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(1);

    const next = useCallback(() => {
        setDirection(1);
        setCurrent(prev => (prev + 1) % SLIDES.length);
    }, []);

    useEffect(() => {
        const timer = setInterval(next, 5000);
        return () => clearInterval(timer);
    }, [next]);

    const goTo = (i) => {
        setDirection(i > current ? 1 : -1);
        setCurrent(i);
    };

    const slide = SLIDES[current];

    return (
        <section className="relative h-screen min-h-[600px] max-h-[1100px] overflow-hidden bg-background">

            {/* ── Slideshow Background ────────────────────────── */}
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                    key={current}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                >
                    <img
                        src={slide.img}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                    />
                </motion.div>
            </AnimatePresence>

            {/* ── Overlays ────────────────────────────────────── */}
            {/* Dark vignette */}
            <div className="absolute inset-0 bg-black/55 z-[1]" />
            {/* Bottom gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30 z-[2]" />
            {/* Left gradient for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent z-[2]" />

            {/* ── Red accent lines ────────────────────────────── */}
            <div className="absolute top-0 left-[8%] w-[1px] h-full bg-gradient-to-b from-primary/30 via-primary/5 to-transparent z-[3] hidden lg:block" />

            {/* ── Content ─────────────────────────────────────── */}
            <div className="relative z-10 container mx-auto px-5 lg:px-8 h-full flex flex-col justify-end pb-32 lg:pb-36">

                {/* Slide counter */}
                <motion.div
                    className="flex items-center gap-3 mb-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <span className="font-heading font-bold text-primary text-sm tracking-wider">
                        0{current + 1}
                    </span>
                    <div className="w-8 h-[1px] bg-white/20" />
                    <span className="font-heading text-white/25 text-sm tracking-wider">
                        0{SLIDES.length}
                    </span>
                </motion.div>

                {/* Heading - animated per slide */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`text-${current}`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <h1 className="font-heading font-bold text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[1.1] uppercase text-white tracking-[0.02em] mb-3 max-w-[700px]">
                            {slide.title}
                        </h1>
                        <p className="font-body text-white/45 text-base lg:text-lg max-w-[500px] mb-8">
                            {slide.sub}
                        </p>
                    </motion.div>
                </AnimatePresence>

                {/* CTAs */}
                <motion.div
                    className="flex flex-col sm:flex-row gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    <a
                        href="#plans"
                        className="group inline-flex items-center justify-center gap-2 bg-primary hover:bg-red-700 text-white py-4 px-10 rounded-btn font-heading font-bold uppercase tracking-[3px] text-sm transition-all duration-300 hover:shadow-[0_0_35px_rgba(255,0,0,0.4)] hover:-translate-y-0.5"
                    >
                        Обрати план
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </a>
                    <a
                        href="#schedule"
                        className="inline-flex items-center justify-center border border-white/20 text-white/60 hover:text-white hover:border-white/40 py-4 px-10 rounded-btn font-heading font-bold uppercase tracking-[3px] text-sm transition-all duration-300 backdrop-blur-sm"
                    >
                        Розклад
                    </a>
                </motion.div>
            </div>

            {/* ── Slide Indicators (right side) ───────────────── */}
            <div className="absolute right-6 lg:right-10 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-3">
                {SLIDES.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i)}
                        className={`transition-all duration-500 rounded-full ${
                            i === current
                                ? 'w-2.5 h-8 bg-primary shadow-[0_0_12px_rgba(255,0,0,0.6)]'
                                : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                        }`}
                        aria-label={`Slide ${i + 1}`}
                    />
                ))}
            </div>

            {/* ── Bottom Stats Bar ─────────────────────────────── */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 z-20"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
            >
                <div className="border-t border-white/[0.08]" style={{ background: 'rgba(8,8,8,0.85)', backdropFilter: 'blur(12px)' }}>
                    <div className="container mx-auto px-5 lg:px-8">
                        <div className="grid grid-cols-2 lg:grid-cols-4">
                            {[
                                { val: '500+', lab: 'Клієнтів' },
                                { val: '15', lab: 'Тренерів' },
                                { val: '24/7', lab: 'Доступ' },
                                { val: '1200', lab: 'М² залу' },
                            ].map(({ val, lab }, i) => (
                                <div key={lab} className={`py-4 px-6 flex items-center gap-3 group cursor-default ${i > 0 ? 'border-l border-white/[0.06]' : ''}`}>
                                    <span className="font-heading font-bold text-xl lg:text-2xl text-white/90 group-hover:text-primary transition-colors duration-300">
                                        {val}
                                    </span>
                                    <span className="font-body text-white/20 text-[0.6rem] uppercase tracking-[2px] group-hover:text-white/35 transition-colors duration-300">
                                        {lab}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── Progress Bar (top) ──────────────────────────── */}
            <div className="absolute top-0 left-0 right-0 z-20 h-[3px] bg-white/[0.05]">
                <motion.div
                    className="h-full bg-primary"
                    key={`progress-${current}`}
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 5, ease: 'linear' }}
                    style={{ boxShadow: '0 0 10px rgba(255,0,0,0.5)' }}
                />
            </div>
        </section>
    );
}
