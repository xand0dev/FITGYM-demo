import { useEffect, useState } from 'react';
import { publicRequest } from '../utils/api';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Імпорт компонентів

import Hero from '../components/Hero';
import Stats from '../components/Stats'; 
import Categories from '../components/Categories'; 
import Plans from '../components/Plans';
import Contacts from '../components/Contacts';
import BMICalculator from '../components/BMICalculator';
import Carousel from '../components/Carousel'; 
import Schedule from '../components/Schedule';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const [trainers, setTrainers] = useState([]);
    const { user } = useAuth(); 

    useEffect(() => {
        // Ініціалізація анімацій при скролі
        AOS.init({ 
            duration: 1000, 
            once: true,
            offset: 120 
        });
        loadTrainers();
    }, []);

    const loadTrainers = async () => {
        try {
            const data = await publicRequest('/api/instructors/');
            setTrainers(data);
        } catch (e) { 
            console.error("Помилка завантаження тренерів:", e); 
        }
    };

    return (
        <>
           

            <main style={{ background: '#fff' }}>
                {/* 1. Головний банер (Брутальний стиль) */}
                <Hero />

                {/* 2. Анімована статистика (Counter Up) */}
                <Stats />

                {/* 3. Категорії тренувань (Bento Grid з фоновими фото) */}
                <Categories />

                {/* 4. Секція Переваг з фоновим фото та паралаксом */}
                <section id="advantages" className="advantages-section">
                    <div className="advantages-overlay"></div>
                    
                    <div className="container advantages-content">
                        <h2 className="advantages-title">
                            ЧОМУ ОБИРАЮТЬ <span className="accent-red">FITGYM</span>?
                        </h2>
                        
                        <div className="advantages-grid">
                            <div className="advantage-card" data-aos="fade-right">
                                <i className="fas fa-user-tie fa-3x"></i>
                                <h3>ПРОФЕСІЙНІ ТРЕНЕРИ</h3>
                                <p>Сертифіковані фахівці, що допоможуть досягти результату в Бердичеві.</p>
                            </div>
                            
                            <div className="advantage-card" data-aos="fade-up">
                                <i className="fas fa-dumbbell fa-3x"></i>
                                <h3>СУЧАСНЕ ОБЛАДНАННЯ</h3>
                                <p>Найкращі тренажери останнього покоління для твого прогресу.</p>
                            </div>
                            
                            <div className="advantage-card" data-aos="fade-left">
                                <i className="fas fa-clock fa-3x"></i>
                                <h3>ЗРУЧНИЙ РОЗКЛАД</h3>
                                <p>Тренування 24/7, що підлаштовуються під твій ритм життя.</p>
                            </div>
                        </div>
                    </div>

                    <style>{`
                        .advantages-section {
                            position: relative;
                            padding: 120px 0;
                            background-image: url('https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1975');
                            background-size: cover;
                            background-position: center;
                            background-attachment: fixed;
                            overflow: hidden;
                        }

                        .advantages-overlay {
                            position: absolute;
                            top: 0; left: 0; width: 100%; height: 100%;
                            background: rgba(0, 0, 0, 0.85);
                            z-index: 1;
                        }

                        .advantages-content {
                            position: relative;
                            z-index: 2;
                            max-width: 1200px;
                            margin: 0 auto;
                            text-align: center;
                            color: #fff;
                        }

                        .advantages-title {
                            font-size: clamp(2rem, 5vw, 3.5rem);
                            font-weight: 950;
                            margin-bottom: 80px;
                            letter-spacing: -1px;
                        }

                        .accent-red { color: #ff0000; }

                        .advantages-grid {
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                            gap: 30px;
                        }

                        .advantage-card {
                            background: rgba(255, 255, 255, 0.05);
                            border: 2px solid rgba(255, 255, 255, 0.1);
                            padding: 60px 40px;
                            transition: 0.4s;
                            backdrop-filter: blur(5px);
                        }

                        .advantage-card:hover {
                            background: #fff;
                            transform: translateY(-10px);
                            border-color: #ff0000;
                        }

                        .advantage-card i {
                            color: #ff0000;
                            margin-bottom: 25px;
                            transition: 0.4s;
                        }

                        .advantage-card h3 {
                            font-size: 1.4rem;
                            font-weight: 900;
                            margin-bottom: 15px;
                            transition: 0.4s;
                        }

                        .advantage-card p {
                            font-size: 1rem;
                            line-height: 1.6;
                            color: rgba(255, 255, 255, 0.7);
                            transition: 0.4s;
                        }

                        .advantage-card:hover h3, 
                        .advantage-card:hover p {
                            color: #000;
                        }
                    `}</style>
                </section>

                {/* 5. Розклад занять */}
                <Schedule />

                {/* 6. Калькулятор BMI */}
                <BMICalculator />

                {/* 7. Галерея (Слайдер) */}
                <Carousel /> 

                {/* 8. Секція Команди */}
                <section id="trainers" className="section container" style={{ padding: '100px 20px' }}>
                    <h2 style={{ textAlign: 'center', fontSize: '2.8rem', fontWeight: '950', marginBottom: '60px', textTransform: 'uppercase' }}>
                        Команда <span style={{color: '#ff0000'}}>профі</span>
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
                        {trainers.map(t => (
                            <div key={t.id} className="trainer-card" data-aos="zoom-in" style={{ 
                                border: '3px solid #000', 
                                background: '#fff',
                                transition: '0.3s'
                            }}>
                                <div style={{ height: '350px', background: '#111', color: '#fff', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                                    <i className="fas fa-user fa-6x" style={{opacity: '0.2'}}></i>
                                </div>
                                <div style={{ padding: '30px', textAlign: 'center' }}>
                                    <h3 style={{ fontWeight: '900', textTransform: 'uppercase', margin: '0 0 10px 0', fontSize: '1.4rem' }}>{t.full_name || t.name}</h3>
                                    <p style={{ color: '#ff0000', fontWeight: '800', fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>{t.specialties || t.specialization}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 9. Тарифи з фоновим фото */}
                <Plans />
                
                {/* 10. Контакти */}
                <Contacts />
            </main>
        </>
    );
}