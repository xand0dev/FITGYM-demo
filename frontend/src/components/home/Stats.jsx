import React, { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }
    })
};

const StatItem = ({ endValue, suffix, label, index }) => {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) setIsVisible(true);
        }, { threshold: 0.3 });
        if (domRef.current) observer.observe(domRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;
        let start = 0;
        const duration = 2000;
        const increment = endValue / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= endValue) {
                setCount(endValue);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [isVisible, endValue]);

    return (
        <motion.div
            ref={domRef}
            custom={index}
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative flex flex-col items-center justify-center flex-1 min-w-[220px] px-6 py-10 glass-card hover:border-primary/30 transition-all duration-300"
        >
            {/* Background accent */}
            <div className="absolute inset-0 rounded-card bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative flex items-baseline gap-1 mb-3">
                <span className="font-display text-[clamp(3rem,5vw,4.5rem)] text-white leading-none">
                    {count}
                </span>
                <span className="font-display text-primary text-[clamp(1.5rem,2.5vw,2.2rem)]">{suffix}</span>
            </div>

            <div className="relative font-heading text-[0.8rem] font-semibold text-white/40 uppercase tracking-[3px] text-center group-hover:text-white/60 transition-colors">
                {label}
            </div>

            {/* Bottom glow line */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-primary rounded-full transition-all duration-500 group-hover:w-[60%]"
                 style={{ boxShadow: '0 0 10px rgba(255,0,0,0.5)' }} />
        </motion.div>
    );
};

export default function Stats() {
    return (
        <section className="py-24 bg-background overflow-hidden relative">
            {/* Subtle bg glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/3 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto max-w-[1200px] px-5 lg:px-10 relative z-10">
                {/* Section heading */}
                <motion.div
                    className="text-center mb-14"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="font-heading text-primary text-xs uppercase tracking-[4px]">Наші показники</span>
                    <h2 className="font-display text-[clamp(2.5rem,6vw,4rem)] text-white uppercase tracking-wide mt-2">
                        Цифри, що <span className="text-gradient-red">говорять</span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatItem endValue={1200} suffix="М²"  label="ПРОСТОРУ"  index={0} />
                    <StatItem endValue={15}   suffix=""    label="ЕКСПЕРТІВ" index={1} />
                    <StatItem endValue={500}  suffix="+"   label="КЛІЄНТІВ"  index={2} />
                    <StatItem endValue={24}   suffix="/7"  label="ДОСТУПУ"   index={3} />
                </div>
            </div>
        </section>
    );
}