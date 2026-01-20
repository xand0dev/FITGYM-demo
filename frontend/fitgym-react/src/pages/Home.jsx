// src/pages/Home.jsx
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom'; // <--- ВАЖЛИВО: Імпорт для useOutletContext
import { publicRequest } from '../utils/api';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Plans from '../components/Plans';
import Contacts from '../components/Contacts';
import BMICalculator from '../components/BMICalculator';
import Carousel from '../components/Carousel'; 
import Schedule from '../components/Schedule';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

export default function Home() {
    const [trainers, setTrainers] = useState([]);
    const { user } = useAuth();
    
    // Беремо функції з контексту UI, а не Outlet, бо ми вже перейшли на Global UIContext
    const { openLogin, openRegister } = useUI(); 

    useEffect(() => {
        AOS.init({ duration: 800, once: true });
        loadTrainers();
    }, []);

    const loadTrainers = async () => {
        try {
            const data = await publicRequest('/api/instructors/');
            setTrainers(data);
        } catch (e) { console.error(e); }
    };

    return (
        <>
            {/* HERO SECTION */}
            <section className="hero">
                <div className="hero-inner container" data-aos="fade-up">
                    <h1>Ваша фітнесова подорож починається тут</h1>
                    <p>Приєднуйтесь до нашого клубу та досягайте цілей з професіоналами.</p>
                    <div className="hero-actions">
                        {!user ? (
                            <>
                                <button onClick={openLogin} className="btn btn-primary" style={{marginRight: '10px'}}>Вхід</button>
                                <button onClick={openRegister} className="btn btn-ghost">Реєстрація</button>
                            </>
                        ) : (
                            <a href="#plans" className="btn btn-primary">Обрати абонемент</a>
                        )}
                    </div>
                </div>
            </section>

            {/* ADVANTAGES */}
            <section id="advantages" className="section container">
                <h2>Чому обирають FITGYM?</h2>
                <div className="grid cols-3">
                    <div className="card" data-aos="fade-right">
                        <i className="fas fa-user-tie fa-2x" style={{color: 'var(--accent)', marginBottom: '10px'}}></i>
                        <div className="card-title">Професійні тренери</div>
                        <div className="card-text">Сертифіковані фахівці.</div>
                    </div>
                    <div className="card" data-aos="fade-up">
                        <i className="fas fa-dumbbell fa-2x" style={{color: 'var(--accent)', marginBottom: '10px'}}></i>
                        <div className="card-title">Сучасне обладнання</div>
                        <div className="card-text">Тренажери останнього покоління.</div>
                    </div>
                    <div className="card" data-aos="fade-left">
                        <i className="fas fa-clock fa-2x" style={{color: 'var(--accent)', marginBottom: '10px'}}></i>
                        <div className="card-title">Зручний розклад</div>
                        <div className="card-text">Групові та індивідуальні заняття.</div>
                    </div>
                </div>
            </section>

            {/* ВСТАВЛЯЄМО КАЛЕНДАР ТУТ */}
            <Schedule />

            {/* КАЛЬКУЛЯТОР */}
            <BMICalculator />

            {/* СЛАЙДЕР (CAROUSEL) */}
            <Carousel /> {/* <--- 2. Вставка Слайдера */}

            {/* TRAINERS */}
            <section id="trainers" className="section container">
                <h2>Наші професійні тренери</h2>
                <div className="grid cols-3">
                    {trainers.map(t => (
                        <div key={t.id} className="card" data-aos="zoom-in" style={{textAlign:'center'}}>
                            <div style={{height: '200px', background: '#333', marginBottom:'15px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                <i className="fas fa-user fa-4x"></i>
                            </div>
                            <h3>{t.full_name || t.name}</h3>
                            <p style={{color: 'var(--accent)'}}>{t.specialties || t.specialization}</p>
                        </div>
                    ))}
                </div>
            </section>

            <Plans />
            <Contacts />
        </>
    );
}