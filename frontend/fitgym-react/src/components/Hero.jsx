import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

export default function Hero() {
    const { user } = useAuth();
    const { openLogin, openRegister } = useUI();

    return (
        <section className="hero">
            {/* data-aos для анімації появи */}
            <div className="hero-inner container" data-aos="fade-up">
                <h1>Ваша фітнесова подорож починається тут</h1>
                <p>Приєднуйтесь до нашого клубу та досягайте цілей з професіоналами.</p>
                
                <div className="hero-actions">
                    {!user ? (
                        <>
                            <button onClick={openLogin} className="btn btn-primary">
                                Вхід
                            </button>
                            <button onClick={openRegister} className="btn btn-ghost">
                                Реєстрація
                            </button>
                        </>
                    ) : (
                        <a href="#plans" className="btn btn-primary">
                            Обрати абонемент
                        </a>
                    )}
                </div>
            </div>
        </section>
    );
}