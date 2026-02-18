import React, { useEffect, useState } from 'react';

export default function Preloader() {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
        }, 1500); // Зникне через 1.5 секунди
        return () => clearTimeout(timer);
    }, []);

    if (!visible) return null;

    return (
        <div className="preloader-overlay">
            <div className="preloader-content">
                <h1 className="preloader-logo">FIT<span className="red">GYM</span></h1>
                <div className="preloader-bar">
                    <div className="preloader-progress"></div>
                </div>
                <p className="preloader-text">ГОТУЄМО ЗАЛ ДО ТРЕНУВАННЯ...</p>
            </div>

            <style>{`
                .preloader-overlay {
                    position: fixed;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: #000;
                    display: flex; align-items: center; justify-content: center;
                    z-index: 999999;
                }
                .preloader-content { text-align: center; }
                .preloader-logo {
                    font-size: 5rem;
                    font-weight: 950;
                    color: #fff;
                    margin-bottom: 20px;
                    letter-spacing: -2px;
                    animation: pulse 1s infinite alternate;
                }
                .red { color: #ff0000; }
                .preloader-bar {
                    width: 200px;
                    height: 4px;
                    background: #222;
                    margin: 0 auto 15px;
                    position: relative;
                    overflow: hidden;
                }
                .preloader-progress {
                    width: 0%;
                    height: 100%;
                    background: #ff0000;
                    animation: load 1.5s ease-in-out forwards;
                }
                .preloader-text {
                    color: #666;
                    font-weight: 800;
                    font-size: 0.8rem;
                    letter-spacing: 2px;
                }
                @keyframes load { to { width: 100%; } }
                @keyframes pulse { from { transform: scale(1); } to { transform: scale(1.05); } }
            `}</style>
        </div>
    );
}