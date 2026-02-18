export default function Footer() {
    const colTitleStyle = {
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: '900',
        textTransform: 'uppercase',
        fontSize: '0.8rem',
        letterSpacing: '2px',
        color: '#ff0000',
        marginBottom: '25px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    };

    const linkStyle = {
        color: '#fff',
        textDecoration: 'none',
        fontSize: '0.95rem',
        fontWeight: '500',
        transition: '0.3s',
        display: 'block',
        marginBottom: '12px',
        opacity: 0.6
    };

    return (
        <footer style={{ 
            background: '#000', 
            color: '#fff', 
            padding: '100px 0 40px', 
            position: 'relative', 
            overflow: 'hidden' 
        }}>
            {/* ВЕЛИКИЙ ФОНОВИЙ ТЕКСТ (Watermark) */}
            <div style={{
                position: 'absolute',
                top: '20px',
                right: '-50px',
                fontSize: '15rem',
                fontWeight: '900',
                color: 'rgba(255, 255, 255, 0.03)',
                fontStyle: 'italic',
                pointerEvents: 'none',
                userSelect: 'none',
                fontFamily: "'Montserrat', sans-serif"
            }}>
                GYM
            </div>

            <div className="container">
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1.5fr 1fr 1fr 1.2fr', 
                    gap: '60px',
                    position: 'relative',
                    zIndex: 1,
                    paddingBottom: '80px'
                }}>
                    
                    {/* БРЕНДИНГ ТА СЛОГАН */}
                    <div data-aos="fade-up">
                        <div style={{ 
                            fontFamily: "'Montserrat', sans-serif", 
                            fontWeight: '900', 
                            fontSize: '2.5rem', 
                            fontStyle: 'italic',
                            lineHeight: '1',
                            marginBottom: '20px' 
                        }}>
                            FIT<span style={{ color: '#ff0000' }}>GYM</span>
                        </div>
                        <p style={{ color: '#666', fontSize: '1rem', lineHeight: '1.5', maxWidth: '260px' }}>
                            Ми створюємо культуру сили та здоров'я в самому серці Бердичева.
                        </p>
                    </div>

                    {/* НАВІГАЦІЯ */}
                    <div data-aos="fade-up" data-aos-delay="100">
                        <h3 style={colTitleStyle}><span style={{width:'15px', height:'2px', background:'#ff0000'}}></span>Клуб</h3>
                        <a href="#trainers" style={linkStyle} className="footer-link">Команда тренерів</a>
                        <a href="/#schedule" style={linkStyle} className="footer-link">Графік занять</a>
                        <a href="/#plans" style={linkStyle} className="footer-link">Тарифи</a>
                    </div>

                    {/* ДОКУМЕНТИ */}
                    <div data-aos="fade-up" data-aos-delay="200">
                        <h3 style={colTitleStyle}><span style={{width:'15px', height:'2px', background:'#ff0000'}}></span>Правова інфо</h3>
                        <a href="#" style={linkStyle} className="footer-link">Договір оферти</a>
                        <a href="#" style={linkStyle} className="footer-link">Правила залу</a>
                        <a href="#" style={linkStyle} className="footer-link">Конфіденційність</a>
                    </div>

                    {/* КОНТАКТ ШВИДКОГО ДОСТУПУ */}
                    <div data-aos="fade-up" data-aos-delay="300">
                        <h3 style={colTitleStyle}><span style={{width:'15px', height:'2px', background:'#ff0000'}}></span>Зв'язок</h3>
                        <div style={{fontSize: '1.2rem', fontWeight: '700', marginBottom: '10px'}}>+38 (097) 123-45-67</div>
                        <div style={{color: '#ff0000', fontWeight: '800', fontSize: '0.8rem'}}>ПН-НД: 07:00 — 22:00</div>
                        <div style={{marginTop: '25px', display: 'flex', gap: '15px'}}>
                            {['instagram', 'telegram', 'facebook'].map(social => (
                                <a key={social} href="#" style={{ color: '#fff', fontSize: '1.2rem', transition: '0.3s' }} className="social-hover">
                                    <i className={`fab fa-${social}`}></i>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* НИЖНЯ ЛІНІЯ */}
                <div style={{ 
                    paddingTop: '40px', 
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.8rem',
                    color: '#444'
                }}>
                    <div>
                        © 2026 FITGYM BERDYCHIV. <br/>
                        DESIGNED BY POLINA TOVSTUKHA.
                    </div>
                    <div style={{ textAlign: 'right', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '800' }}>
                        No pain <span style={{ color: '#ff0000' }}>No gain</span>
                    </div>
                </div>
            </div>

            {/* CSS ДЛЯ ЕФЕКТІВ (можна додати в App.css або через styled-components) */}
            <style>{`
                .footer-link:hover { opacity: 1 !important; color: #ff0000 !important; transform: translateX(5px); }
                .social-hover:hover { color: #ff0000 !important; transform: translateY(-3px); }
            `}</style>
        </footer>
    );
}