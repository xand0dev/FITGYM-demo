import { useAuth } from '../../context/AuthContext';

export default function Hero() {
    const { user } = useAuth();

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
                        {/* ЗАЛИШАЄМО ТІЛЬКИ ОДНУ КНОПКУ ДЛЯ ВСІХ КОРИСТУВАЧІВ */}
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
                    </div>
                </div>

                {/* ПРАВА ЧАСТИНА: ФОТО */}
                <div className="hero-image-block" style={{flex: '1', minWidth: '350px', position: 'relative', display: 'flex', justifyContent: 'center'}} data-aos="fade-left">
                    <img 
                        src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2069&auto=format&fit=crop" 
                        alt="Athlete" 
                        style={{
                            width: '100%', 
                            height: 'auto', 
                            display: 'block', 
                            objectFit: 'contain', 
                            maxHeight: '650px', 
                            filter: 'grayscale(100%) contrast(1.1)', 
                            maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)', 
                            WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)'
                        }} 
                    />
                </div>

            </div>
        </section>
    );
}