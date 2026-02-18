import React, { useState, useEffect, useRef } from 'react';

const StatItem = ({ endValue, suffix, label }) => {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) setIsVisible(true);
        }, { threshold: 0.3 });
        observer.observe(domRef.current);
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
        <div ref={domRef} className="stat-box" style={{
            flex: '1',
            minWidth: '240px', // Трохи збільшили ширину, щоб влізало "1200 М²"
            padding: '40px 20px',
            border: '2px solid #000',
            background: '#fff',
            transition: '0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{
                fontSize: 'clamp(3rem, 5vw, 4.5rem)',
                fontWeight: '950',
                color: '#111',
                lineHeight: '1',
                marginBottom: '10px',
                fontFamily: "'Montserrat', sans-serif",
                whiteSpace: 'nowrap', // Забороняє переносу, щоб символ не відпадав
                display: 'flex',
                alignItems: 'baseline'
            }}>
                <span style={{ marginRight: '5px' }}>{count}</span>
                <span style={{ color: '#ff0000', fontSize: '0.6em' }}>{suffix}</span>
            </div>
            
            <div style={{
                fontSize: '0.85rem',
                fontWeight: '800',
                color: '#666',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                textAlign: 'center'
            }}>
                {label}
            </div>
            
            <div className="stat-line"></div>
        </div>
    );
};

export default function Stats() {
    return (
        <section style={{ padding: '100px 0', background: '#f9f9f9', overflow: 'hidden' }}>
            <div className="container" style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 40px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '25px'
            }}>
                <StatItem endValue={1200} suffix="М²" label="ПРОСТОРУ" />
                <StatItem endValue={15} suffix="" label="ЕКСПЕРТІВ" />
                <StatItem endValue={500} suffix="+" label="КЛІЄНТІВ" />
                <StatItem endValue={24} suffix="/7" label="ДОСТУПУ" />
            </div>

            <style>{`
                .stat-box {
                    box-sizing: border-box;
                }
                .stat-box:hover {
                    transform: translate(-10px, -10px);
                    box-shadow: 15px 15px 0px #000;
                    border-color: #ff0000;
                }
                .stat-line {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 0%;
                    height: 6px;
                    background: #ff0000;
                    transition: 0.6s;
                }
                .stat-box:hover .stat-line {
                    width: 100%;
                }
            `}</style>
        </section>
    );
}