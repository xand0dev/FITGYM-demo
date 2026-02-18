export default function Plans() {
    const plans = [
        {
            id: 1,
            title: 'Разове тренування',
            price: '200 ₴',
            features: ['Доступ до залу', 'Безлімітний час', 'Консультація тренера'],
            isPopular: false
        },
        {
            id: 2,
            title: '12 Тренувань',
            price: '1800 ₴',
            features: ['Діє 1 місяць', 'Заморозка на 7 днів', 'Групові заняття'],
            isPopular: true
        },
        {
            id: 3,
            title: 'Безліміт 1 Місяць',
            price: '2500 ₴',
            features: ['Без обмежень', 'Заморозка на 14 днів', 'Персональне тренування'],
            isPopular: false
        }
    ];

    const cardStyle = (isPopular) => ({
        background: isPopular ? '#000' : '#fff',
        color: isPopular ? '#fff' : '#000',
        padding: '50px 30px',
        border: '1px solid #000',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transition: '0.3s',
        boxShadow: isPopular ? '15px 15px 0px #ff0000' : 'none',
        transform: isPopular ? 'translateY(-10px)' : 'none'
    });

    const titleStyle = {
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: '900',
        fontStyle: 'italic',
        fontSize: '1.2rem',
        textTransform: 'uppercase',
        marginBottom: '20px',
        textAlign: 'center'
    };

    const priceStyle = {
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: '900',
        fontSize: '3rem',
        marginBottom: '30px',
        color: '#ff0000'
    };

    return (
        <section id="plans" style={{ padding: '100px 0', background: '#fff' }}>
            <div className="container">
                <div style={{ borderLeft: '8px solid #ff0000', paddingLeft: '20px', marginBottom: '60px' }}>
                    <h2 style={{ 
                        fontFamily: "'Montserrat', sans-serif", 
                        fontWeight: '900', 
                        fontSize: '3rem', 
                        textTransform: 'uppercase', 
                        lineHeight: '0.9', 
                        margin: 0 
                    }}>
                        Оберіть свій <br /> <span style={{ color: '#ff0000' }}>Абонемент</span>
                    </h2>
                </div>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                    gap: '40px',
                    alignItems: 'start'
                }}>
                    {plans.map(plan => (
                        <div key={plan.id} style={cardStyle(plan.isPopular)}>
                            {plan.isPopular && (
                                <div style={{ 
                                    position: 'absolute', top: '-15px', background: '#ff0000', 
                                    color: '#fff', padding: '5px 15px', fontWeight: '900', 
                                    fontSize: '0.8rem', textTransform: 'uppercase' 
                                }}>
                                    ХІТ ПРОДАЖІВ
                                </div>
                            )}
                            
                            <h3 style={titleStyle}>{plan.title}</h3>
                            <div style={priceStyle}>{plan.price}</div>
                            
                            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '40px', width: '100%' }}>
                                {plan.features.map((feat, i) => (
                                    <li key={i} style={{ 
                                        padding: '10px 0', 
                                        borderBottom: `1px solid ${plan.isPopular ? '#222' : '#eee'}`,
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        textAlign: 'center'
                                    }}>
                                        {feat}
                                    </li>
                                ))}
                            </ul>

                            <button style={{
                                width: '100%',
                                padding: '15px',
                                background: plan.isPopular ? '#ff0000' : '#000',
                                color: '#fff',
                                border: 'none',
                                fontWeight: '900',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                transition: '0.3s'
                            }} className="plan-btn">
                                Обрати план
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <style>{`
                .plan-btn:hover {
                    transform: scale(1.05);
                    filter: brightness(1.2);
                }
            `}</style>
        </section>
    );
}