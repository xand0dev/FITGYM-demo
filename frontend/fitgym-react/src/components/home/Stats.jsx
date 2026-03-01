import React, { useState, useEffect, useRef } from 'react';

const StatItem = ({ endValue, suffix, label }) => {
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
        <div ref={domRef} className="group relative flex flex-col items-center justify-center flex-1 min-w-[240px] px-5 py-10 bg-white border-2 border-black box-border transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-x-2.5 hover:-translate-y-2.5 hover:shadow-[15px_15px_0px_#000] hover:border-primary">
            <div className="text-[clamp(3rem,5vw,4.5rem)] font-black text-[#111] leading-none mb-2.5 font-['Montserrat',sans-serif] whitespace-nowrap flex items-baseline">
                <span className="mr-1.5">{count}</span>
                <span className="text-primary text-[0.6em]">{suffix}</span>
            </div>
            
            <div className="text-[0.85rem] font-extrabold text-[#666] uppercase tracking-[2px] text-center">
                {label}
            </div>
            
            {/* Анімована лінія */}
            <div className="absolute bottom-0 left-0 w-0 h-1.5 bg-primary transition-all duration-600 group-hover:w-full"></div>
        </div>
    );
};

export default function Stats() {
    return (
        <section className="py-[100px] bg-[#f9f9f9] overflow-hidden">
            <div className="container mx-auto max-w-[1200px] px-10 grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-[25px]">
                <StatItem endValue={1200} suffix="М²" label="ПРОСТОРУ" />
                <StatItem endValue={15} suffix="" label="ЕКСПЕРТІВ" />
                <StatItem endValue={500} suffix="+" label="КЛІЄНТІВ" />
                <StatItem endValue={24} suffix="/7" label="ДОСТУПУ" />
            </div>
        </section>
    );
}