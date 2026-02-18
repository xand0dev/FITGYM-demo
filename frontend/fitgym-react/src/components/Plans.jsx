import React from 'react';

const PlanCard = ({ title, price, features, isFeatured }) => (
    <div className={`plan-card ${isFeatured ? 'featured' : ''}`} data-aos={isFeatured ? "zoom-in" : "fade-up"}>
        {isFeatured && <div className="plan-badge">Популярний</div>}
        <h3 className="plan-title">{title}</h3>
        <div className="plan-price">
            <span className="currency">₴</span>
            {price}
            <span className="period">/ міс</span>
        </div>
        <div className="plan-divider"></div>
        <ul className="plan-features">
            {features.map((f, i) => (
                <li key={i}><i className="fas fa-check"></i> {f}</li>
            ))}
        </ul>
        <button className="plan-button">Обрати план</button>
    </div>
);

export default function Plans() {
    return (
        <section id="plans" className="plans-section">
            {/* Шар затемнення для фону */}
            <div className="plans-overlay"></div>
            
            <div className="container plans-content">
                <div className="plans-header">
                    <h2 className="plans-main-title">
                        Оберіть свій <span className="accent-text">рівень</span>
                    </h2>
                    <p className="plans-subtitle">Прозорі ціни для твоїх перемог</p>
                </div>

                <div className="plans-grid">
                    <PlanCard 
                        title="Базовий" 
                        price="800" 
                        features={["8 тренувань на місяць", "Доступ до кардіо зони", "Роздягальня та душ"]} 
                    />
                    <PlanCard 
                        title="Безліміт" 
                        price="1200" 
                        isFeatured 
                        features={["Необмежена кількість відвідувань", "Всі зони залу", "1 безкоштовне тренування", "Доступ 24/7"]} 
                    />
                    <PlanCard 
                        title="PRO" 
                        price="2500" 
                        features={["Безлімітний доступ", "Персональний план харчування", "Заморозка абонементу", "Пріоритетний запис"]} 
                    />
                </div>
            </div>

            <style>{`
                .plans-section {
                    position: relative;
                    padding: 120px 0;
                    /* ЗАМІНИ ЦЕ ПОСИЛАННЯ НА СВОЄ ФОТО ЗАЛУ */
                    background-image: url('https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070');
                    background-size: cover;
                    background-position: center;
                    background-attachment: fixed; /* Ефект паралаксу */
                    overflow: hidden;
                }

                .plans-overlay {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0, 0, 0, 0.8); /* Темний фільтр поверх фото */
                    z-index: 1;
                }

                .plans-content {
                    position: relative;
                    z-index: 2;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 5%;
                }

                .plans-header {
                    text-align: center;
                    margin-bottom: 70px;
                    color: #fff;
                }

                .plans-main-title {
                    font-size: clamp(2.5rem, 6vw, 4.5rem);
                    font-weight: 950;
                    text-transform: uppercase;
                    line-height: 0.9;
                    margin-bottom: 15px;
                }

                .accent-text { color: #ff0000; }

                .plans-subtitle {
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 3px;
                    opacity: 0.8;
                }

                .plans-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 30px;
                    align-items: stretch;
                }

                /* СТИЛІ КАРТОК */
                .plan-card {
                    background: #fff;
                    border: 3px solid #000;
                    padding: 50px 30px;
                    position: relative;
                    transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .plan-card:hover {
                    transform: translateY(-15px);
                    box-shadow: 20px 20px 0px #000;
                }

                .plan-card.featured {
                    border-color: #ff0000;
                    box-shadow: 15px 15px 0px #ff0000;
                }

                .plan-badge {
                    position: absolute;
                    top: -15px;
                    background: #ff0000;
                    color: #fff;
                    padding: 5px 20px;
                    font-weight: 900;
                    text-transform: uppercase;
                    font-size: 0.8rem;
                    border: 2px solid #000;
                }

                .plan-title {
                    font-size: 1.8rem;
                    font-weight: 950;
                    text-transform: uppercase;
                    margin-bottom: 25px;
                    color: #000;
                }

                .plan-price {
                    font-size: 4.5rem;
                    font-weight: 950;
                    color: #ff0000;
                    line-height: 1;
                    margin-bottom: 10px;
                }

                .currency { font-size: 1.5rem; vertical-align: super; }
                .period { font-size: 1rem; color: #666; font-weight: 700; }

                .plan-divider {
                    width: 60px; height: 5px;
                    background: #000;
                    margin: 30px 0;
                }

                .plan-features {
                    list-style: none;
                    padding: 0;
                    margin-bottom: 40px;
                    width: 100%;
                    flex-grow: 1;
                }

                .plan-features li {
                    margin-bottom: 15px;
                    font-weight: 700;
                    color: #333;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 0.95rem;
                }

                .plan-features i { color: #ff0000; }

                .plan-button {
                    width: 100%;
                    padding: 18px;
                    background: #000;
                    color: #fff;
                    border: none;
                    font-weight: 900;
                    text-transform: uppercase;
                    cursor: pointer;
                    transition: 0.3s;
                    letter-spacing: 1px;
                }

                .plan-button:hover {
                    background: #ff0000;
                }

                .plan-card.featured .plan-button { background: #ff0000; }
                .plan-card.featured .plan-button:hover { background: #000; }

                @media (max-width: 600px) {
                    .plan-card.featured { transform: none; }
                    .plan-card.featured:hover { transform: translateY(-10px); }
                }
            `}</style>
        </section>
    );
}