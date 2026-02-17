// src/pages/Home.jsx
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom'; // <--- Залишив, як ти просив
import { publicRequest } from '../utils/api';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Компоненти
import Hero from '../components/Hero'; // <--- Новий компонент
import Plans from '../components/Plans';
import Contacts from '../components/Contacts';
import BMICalculator from '../components/BMICalculator';
import Carousel from '../components/Carousel'; 
import Schedule from '../components/Schedule';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

export default function Home() {
    const [trainers, setTrainers] = useState([]);
    const { user } = useAuth(); // Це тут не використовується напряму, але може знадобитись для іншої логіки
    
    // Хуки useAuth та useUI тут більше не потрібні для Hero, бо вони всередині <Hero />
    // Але якщо вони використовуються десь ще в Home, то залишаємо.
    // В даному коді openLogin/openRegister не використовуються в Home, тому можна прибрати
    // const { openLogin, openRegister } = useUI(); 

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
            {/* HERO SECTION (Винесено) */}
            <Hero />

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
            <Carousel /> 

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