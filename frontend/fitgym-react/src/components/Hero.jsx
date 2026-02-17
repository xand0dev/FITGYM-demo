import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

export default function Hero() {
    const { user } = useAuth();
    const { openLogin, openRegister } = useUI();

    return (
        <section className="hero-modern" style={{padding: '80px 0', background: '#fff', color: '#000', overflow: 'hidden'}}>
            <div className="container" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', minHeight: '600px'}}>
                
                {/* ЛІВА ЧАСТИНА: ТЕКСТ */}
                <div className="hero-content" style={{flex: '1', minWidth: '350px', paddingRight: '20px', zIndex: 2}} data-aos="fade-right">
                    <h1 style={{
                        fontSize: 'clamp(3rem, 6vw, 5.5rem)', 
                        fontWeight: '900', 
                        lineHeight: '0.9', 
                        marginBottom: '25px', 
                        textTransform: 'uppercase', 
                        color: '#111',
                        letterSpacing: '-2px'
                    }}>
                        TOP<br/>
                        SCORER TO<br/>
                        <span style={{color: '#aaa'}}>THE FINAL</span><br/>
                        <span style={{color: '#ddd'}}>MATCH</span>
                    </h1>
                    
                    <p style={{fontSize: '1.1rem', color: '#666', marginBottom: '40px', maxWidth: '480px', lineHeight: '1.6', fontWeight: '500'}}>
                        Ваша фітнесова подорож починається тут. Приєднуйтесь до нашого клубу та досягайте цілей з професіоналами.
                    </p>

                    <div className="hero-actions">
                        {!user ? (
                            <div style={{display: 'flex', gap: '15px', flexWrap: 'wrap'}}>
                                <button 
                                    onClick={openLogin} 
                                    className="btn" 
                                    style={{
                                        background: '#111', 
                                        color: '#fff', 
                                        padding: '16px 45px', 
                                        borderRadius: '6px', 
                                        fontWeight: '700', 
                                        border: 'none', 
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        letterSpacing: '1px'
                                    }}
                                >
                                    ВХІД
                                </button>
                                <button 
                                    onClick={openRegister} 
                                    className="btn"
                                    style={{
                                        background: 'transparent', 
                                        color: '#111', 
                                        border: '2px solid #111', 
                                        padding: '14px 45px', 
                                        borderRadius: '6px', 
                                        fontWeight: '700', 
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        letterSpacing: '1px'
                                    }}
                                >
                                    РЕЄСТРАЦІЯ
                                </button>
                            </div>
                        ) : (
                            <a 
                                href="#plans" 
                                className="btn"
                                style={{
                                    background: '#111', 
                                    color: '#fff', 
                                    padding: '16px 45px', 
                                    borderRadius: '6px', 
                                    fontWeight: '700', 
                                    textDecoration: 'none', 
                                    display: 'inline-block',
                                    fontSize: '0.9rem',
                                    letterSpacing: '1px'
                                }}
                            >
                                ОБРАТИ АБОНЕМЕНТ
                            </a>
                        )}
                    </div>
                </div>

                {/* ПРАВА ЧАСТИНА: ФОТО */}
                <div className="hero-image-block" style={{flex: '1', minWidth: '350px', position: 'relative', display: 'flex', justifyContent: 'center'}} data-aos="fade-left">
                    {/* Використовуємо URL з Unsplash, щоб уникнути помилки імпорту */}
                    <img 
                        src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2069&auto=format&fit=crop" 
                        alt="Athlete" 
                        style={{
                            width: '100%', 
                            height: 'auto', 
                            display: 'block', 
                            objectFit: 'contain', 
                            maxHeight: '650px', 
                            filter: 'grayscale(100%) contrast(1.1)', // Чорно-білий стиль як на макеті
                            maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)', // Плавне зникнення знизу (для webkit браузерів)
                            WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)'
                        }} 
                    />
                </div>

            </div>
        </section>
    );
}