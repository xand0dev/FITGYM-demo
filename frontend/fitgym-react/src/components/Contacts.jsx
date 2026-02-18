export default function Contacts() {
    // Зменшений та більш компактний стиль заголовка
    const titleStyle = {
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: '900',
        fontStyle: 'italic',
        fontSize: 'clamp(2rem, 5vw, 3.2rem)', // Зменшено з 4rem до 3.2rem
        textTransform: 'uppercase',
        lineHeight: '1', // Трохи збільшено для кращої читабельності
        letterSpacing: '-1px', // Менш агресивна щільність
        color: '#000',
        marginBottom: '40px'
    };

    const labelStyle = {
        fontFamily: "'Inter', sans-serif",
        fontSize: '0.7rem',
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        color: '#ff0000',
        display: 'block',
        marginBottom: '6px'
    };

    const valueStyle = {
        fontFamily: "'Inter', sans-serif",
        fontSize: '1.15rem',
        fontWeight: '700',
        color: '#000',
        marginBottom: '30px',
        lineHeight: '1.2'
    };

    return (
        <section id="contacts" style={{ padding: '100px 0', background: '#fff' }}>
            <div className="container" style={{ 
                display: 'flex', 
                gap: '40px', 
                flexWrap: 'wrap',
                alignItems: 'flex-start' 
            }}>
                
                {/* ЛІВА ЧАСТИНА */}
                <div style={{ flex: '1', minWidth: '300px' }} data-aos="fade-right">
                    <h2 style={titleStyle}>
                        Контакти та <br />
                        <span style={{ 
                            color: 'transparent', 
                            WebkitTextStroke: '1.5px #000',
                            opacity: 0.8 
                        }}>Розташування</span>
                    </h2>

                    <div>
                        <span style={labelStyle}>Телефон</span>
                        <p style={valueStyle}>+38 (097) 123-45-67</p>
                    </div>

                    <div>
                        <span style={labelStyle}>Email</span>
                        <p style={valueStyle}>info@fitgym.ua</p>
                    </div>

                    <div>
                        <span style={labelStyle}>Адреса</span>
                        <p style={valueStyle}>вул. Вінницька, 42а, <br/> м. Бердичів</p>
                    </div>

                    <div style={{ width: '40px', height: '4px', background: '#ff0000' }}></div>
                </div>

                {/* ПРАВА ЧАСТИНА: ЧОРНА МАПА */}
                <div style={{ flex: '1.4', minWidth: '350px' }} data-aos="fade-left">
                    <div style={{ 
                        border: '8px solid #000', 
                        boxShadow: '12px 12px 0px #ff0000',
                        position: 'relative',
                        background: '#000' 
                    }}>
                        <iframe 
                            loading="lazy" 
                            title="Мапа Бердичів"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2551.4876!2d28.5836!3d49.8956!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDnCsDUzJzQ0LjIiTiAyOMKwMzUnMDAuOSJF!5e0!3m2!1suk!2sua!4v1645171200000!5m2!1suk!2sua"
                            style={{ 
                                width: '100%', 
                                height: '420px', 
                                border: 0, 
                                display: 'block',
                                filter: 'grayscale(1) invert(1) contrast(1.2)' 
                            }}
                            allowFullScreen=""
                        ></iframe>
                        
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            width: '18px',
                            height: '18px',
                            background: '#ff0000',
                            borderRadius: '50%',
                            border: '3px solid #fff',
                            transform: 'translate(-50%, -50%)',
                            pointerEvents: 'none',
                            boxShadow: '0 0 15px rgba(255, 0, 0, 0.5)'
                        }}></div>
                    </div>
                </div>

            </div>
        </section>
    );
}