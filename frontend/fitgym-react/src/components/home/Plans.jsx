import React, { useState } from 'react';
import { createPortal } from 'react-dom'; // Додано імпорт порталу

const Modal = ({ isOpen, onClose, planTitle }) => {
    if (!isOpen) return null;
    
    // Використовуємо портал для рендеру модалки в body
    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-body" onClick={(e) => e.stopPropagation()}>
                <button className="close-modal" onClick={onClose}>&times;</button>
                <h3 className="modal-header">Оформити підписку</h3>
                <p className="modal-text">Тариф: <span className="accent-text">{planTitle}</span></p>
                <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
                    <input type="text" placeholder="Ім'я" required />
                    <input type="tel" placeholder="Телефон" required />
                    <button type="submit" className="plan-button small-btn">Замовити</button>
                </form>
            </div>
        </div>,
        document.body // <-- Куди рендерити
    );
};

const PlanCard = ({ title, price, features, isFeatured, onSelect }) => (
    <div className={`plan-card ${isFeatured ? 'featured' : ''}`}>
        {isFeatured && <div className="plan-badge">Top</div>}
        <h3 className="plan-title">{title}</h3>
        <div className="plan-price">
            <span className="currency">₴</span>{price}<span className="period">/міс</span>
        </div>
        <ul className="plan-features">
            {features.map((f, i) => <li key={i}>✓ {f}</li>)}
        </ul>
        <button className="plan-button" onClick={() => onSelect(title)}>Обрати</button>
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
        <section id="plans" className="plans-section">
            <div className="plans-overlay"></div>
            <div className="container plans-content">
                <div className="plans-header">
                    <h2 className="plans-main-title">Наші <span className="accent-text">Тарифи</span></h2>
                </div>
                <div className="plans-grid">
                    <PlanCard title="Базовий" price="800" features={["8 тренувань", "Кардіо зона", "Душ"]} onSelect={handlePlanSelect} />
                    <PlanCard title="Безліміт" price="1200" isFeatured features={["Безліміт", "Всі зони", "24/7"]} onSelect={handlePlanSelect} />
                    <PlanCard title="PRO" price="2500" features={["Персональний план", "Заморозка", "Пріоритет"]} onSelect={handlePlanSelect} />
                </div>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} planTitle={selectedPlan} />

            <style>{`
                .plans-section {
                    position: relative;
                    padding: 60px 0;
                    background: url('https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070') center/cover fixed;
                    min-height: 600px;
                    display: flex;
                    align-items: center;
                }
                .plans-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 1; }
                .plans-content { position: relative; z-index: 2; max-width: 1000px; margin: 0 auto; width: 100%; padding: 0 15px; }
                .plans-header { text-align: center; margin-bottom: 40px; color: #fff; }
                .plans-main-title { font-size: 2.2rem; font-weight: 800; text-transform: uppercase; }
                .accent-text { color: #ff0000; }

                .plans-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }

                .plan-card {
                    background: #fff;
                    padding: 25px 20px;
                    border-radius: 12px;
                    text-align: center;
                    transition: 0.3s;
                    position: relative;
                }
                .plan-card:hover { transform: translateY(-5px); }
                .plan-card.featured { border: 2px solid #ff0000; }
                .plan-badge { position: absolute; top: -10px; background: #ff0000; color: #fff; padding: 2px 10px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; }
                
                .plan-title { font-size: 1.2rem; font-weight: 700; color: #333; margin-bottom: 10px; }
                .plan-price { font-size: 2.2rem; font-weight: 800; color: #ff0000; margin-bottom: 15px; }
                .currency { font-size: 1rem; vertical-align: super; }
                .period { font-size: 0.8rem; color: #888; }

                .plan-features { list-style: none; padding: 0; margin-bottom: 20px; text-align: left; }
                .plan-features li { font-size: 0.85rem; color: #555; margin-bottom: 8px; font-weight: 600; }

                .plan-button {
                    width: 100%; padding: 10px; background: #000; color: #fff; border: none; border-radius: 6px;
                    font-weight: bold; text-transform: uppercase; cursor: pointer; transition: 0.3s; font-size: 0.85rem;
                }
                .plan-button:hover { background: #ff0000; }
                .featured .plan-button { background: #ff0000; }

                /* MODAL: Змінено width/height на vh/vw для надійності */
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 1000; }
                .modal-body { background: rgba(255,255,255,0.1); backdrop-filter: blur(15px); border: 1px solid rgba(255,255,255,0.2); padding: 30px; border-radius: 15px; width: 90%; max-width: 320px; color: #fff; text-align: center; position: relative; }
                .close-modal { position: absolute; top: 10px; right: 15px; background: none; border: none; color: #fff; font-size: 24px; cursor: pointer; }
                .modal-header { font-size: 1.2rem; text-transform: uppercase; margin-bottom: 5px; }
                .modal-text { font-size: 0.9rem; margin-bottom: 20px; }
                .modal-form { display: flex; flex-direction: column; gap: 10px; }
                .modal-form input { padding: 10px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; color: #fff; font-size: 0.9rem; }
            `}</style>
        </section>
    );
}