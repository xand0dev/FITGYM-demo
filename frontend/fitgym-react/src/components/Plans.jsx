// src/components/Plans.jsx
export default function Plans() {
    const plans = [
        {
            id: 1,
            title: 'Разове тренування',
            price: '200 ₴',
            features: ['Доступ до залу', 'Безлімітний час', 'Консультація чергового тренера'],
            isPopular: false
        },
        {
            id: 2,
            title: '12 Тренувань',
            price: '1800 ₴',
            features: ['Діє 1 місяць', 'Заморозка на 7 днів', 'Групові заняття включено'],
            isPopular: true
        },
        {
            id: 3,
            title: 'Безліміт 1 Місяць',
            price: '2500 ₴',
            features: ['Без обмежень', 'Заморозка на 14 днів', 'Персональне тренування в подарунок'],
            isPopular: false
        }
    ];

    return (
        <section id="plans" className="section container">
            <h2 className="section-title">Оберіть свій абонемент</h2>
            <p className="section-subtitle">Обирайте план, який відповідає вашим цілям та бюджету.</p>

            <div className="pricing-grid" id="plansGrid">
                {plans.map(plan => (
                    <div key={plan.id} className={`plan-card ${plan.isPopular ? 'popular' : ''}`}>
                        {plan.isPopular && <div className="plan-badge">ХІТ</div>}
                        <h3>{plan.title}</h3>
                        <div className="price">{plan.price}</div>
                        <ul className="features">
                            {plan.features.map((feat, i) => (
                                <li key={i}><i className="fas fa-check"></i> {feat}</li>
                            ))}
                        </ul>
                        <button className={`btn ${plan.isPopular ? 'btn-primary' : 'btn-ghost'}`}>
                            Обрати
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}