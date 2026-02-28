import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useAuthData } from '../hooks/useFitQuery'; 
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Cabinet() {
    const { user, logout } = useAuth();
    const { addToast } = useUI();
    
    // --- 1. ЛОГІКА ТЕМИ ---
    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('gym_theme') !== 'light');
    useEffect(() => {
        localStorage.setItem('gym_theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    // --- 2. ДАНІ ПРОФІЛЮ З БЕКЕНДУ ---
    const firstName = user?.first_name || user?.username || 'Невідомий';
    const lastName = user?.last_name || 'Атлет';
    const email = user?.email || 'Немає email';

    // --- 3. ПАРАМЕТРИ ТІЛА (Біохакінг - локально) ---
    const [weight, setWeight] = useState(() => Number(localStorage.getItem('gym_weight')) || 85);
    const [height, setHeight] = useState(() => Number(localStorage.getItem('gym_height')) || 180);
    const [goal, setGoal] = useState(() => Number(localStorage.getItem('gym_goal')) || 90);
    
    const bmi = height > 0 ? (weight / ((height / 100) ** 2)).toFixed(1) : 0;
    const progressToGoal = Math.min(100, Math.round((weight / goal) * 100));

    // --- 4. РАДАР ЗАПИСІВ (REACT QUERY) ---
    // ВИПРАВЛЕНО: Правильний ендпоінт /api/my-bookings/
    const { data: bookings = [], isLoading: isBookingsLoading } = useAuthData('my-bookings', '/api/my-bookings/');

    // --- 5. КАЛЕНДАР ТА НОТАТКИ ---
    const [userNotes, setUserNotes] = useState(() => JSON.parse(localStorage.getItem('gym_notes')) || {});
    const [activity, setActivity] = useState([15, 100, 15, 100, 15, 15, 15]);
    const [viewDate, setViewDate] = useState(new Date());
    const [activeDayKey, setActiveDayKey] = useState(null);
    const [tempNote, setTempNote] = useState('');

    const formatDateKey = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const refreshActivityChart = useCallback((notes) => {
        const now = new Date();
        const dayIdx = now.getDay();
        const diff = dayIdx === 0 ? 6 : dayIdx - 1;
        const monday = new Date(now);
        monday.setDate(now.getDate() - diff);
        monday.setHours(0, 0, 0, 0);

        const newActivity = [15, 15, 15, 15, 15, 15, 15];
        for (let i = 0; i < 7; i++) {
            const checkDate = new Date(monday);
            checkDate.setDate(monday.getDate() + i);
            const key = formatDateKey(checkDate);
            if (notes[key] && notes[key].trim() !== "") {
                newActivity[i] = 100;
            }
        }
        setActivity(newActivity);
    }, []);

    useEffect(() => {
        AOS.init({ duration: 800 });
        refreshActivityChart(userNotes);
    }, [refreshActivityChart, userNotes]);

    useEffect(() => {
        localStorage.setItem('gym_notes', JSON.stringify(userNotes));
        localStorage.setItem('gym_weight', weight);
        localStorage.setItem('gym_height', height);
        localStorage.setItem('gym_goal', goal);
    }, [userNotes, weight, height, goal]);

    const handleSaveNote = () => {
        const updated = { ...userNotes, [activeDayKey]: tempNote };
        setUserNotes(updated);
        setActiveDayKey(null);
        if (addToast) addToast('План збережено!', 'success');
    };

    const getDaysArray = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 0);
        const days = [];
        let blanks = start.getDay() === 0 ? 6 : start.getDay() - 1;
        for (let i = 0; i < blanks; i++) days.push(null);
        for (let d = 1; d <= end.getDate(); d++) days.push(new Date(year, month, d));
        return days;
    };

    // Трансляція статусів з бекенду
    const getStatusLabel = (status) => {
        switch(status) {
            case 'booked': return 'ЗАПЛАНОВАНО';
            case 'attended': return 'ВІДВІДАНО';
            case 'missed': return 'ПРОПУЩЕНО';
            case 'cancelled': return 'СКАСОВАНО';
            default: return status.toUpperCase();
        }
    };

    return (
        <section className={`cab-root ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
            <div className="cab-bg-layer"></div>
            
            <div className="container cab-relative">
                <button className="cab-theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
                    {isDarkMode ? '🌙 DARK' : '☀️ LIGHT'}
                </button>

                <div className="cab-grid">
                    {/* --- САЙДБАР --- */}
                    <aside className="cab-sidebar" data-aos="fade-right">
                        <div className="cab-profile-top">
                            <div className="cab-avatar"></div>
                            <h2 className="cab-user-name">{firstName} <br/> {lastName}</h2>
                            <div className="cab-badge">{user?.is_superuser ? 'АДМІНІСТРАТОР' : (user?.is_staff ? 'ТРЕНЕР' : 'PRO MEMBER')}</div>
                        </div>

                        <div className="cab-form">
                            <div className="cab-input-box"><label>USERNAME</label><input type="text" value={user?.username || ''} readOnly style={{opacity: 0.7}} /></div>
                            <div className="cab-input-box"><label>EMAIL</label><input type="email" value={email} readOnly style={{opacity: 0.7}} /></div>
                        </div>
                        
                        <button onClick={logout} className="cab-logout-btn">ВИЙТИ З СИСТЕМИ</button>
                    </aside>

                    {/* --- ГОЛОВНА ПАНЕЛЬ --- */}
                    <main className="cab-main">
                        
                        {/* 1. Блок: Біометрія */}
                        <div className="cab-card" data-aos="fade-up" style={{marginBottom: '30px'}}>
                            <div className="cab-card-header">
                                <h4 className="cab-title">БІОМЕТРІЯ</h4>
                                <div className="cab-bmi">BMI: {bmi}</div>
                            </div>
                            
                            <div className="cab-params-grid">
                                <div className="cab-param-item">
                                    <label>ВАГА (КГ)</label>
                                    <div className="cab-param-val">{weight}</div>
                                    <input type="range" min="40" max="150" value={weight} onChange={(e)=>setWeight(Number(e.target.value))} className="cab-slider" />
                                </div>
                                <div className="cab-param-item cab-accent">
                                    <label>ЦІЛЬ (КГ)</label>
                                    <input type="number" value={goal} onChange={(e)=>setGoal(Number(e.target.value))} className="cab-goal-input" />
                                    <div className="cab-progress-track"><div className="cab-progress-fill" style={{width: `${progressToGoal}%`}}></div></div>
                                </div>
                            </div>

                            <div className="cab-height-row">
                                <label>ЗРІСТ (CM): </label>
                                <input type="number" value={height} onChange={(e)=>setHeight(Number(e.target.value))} className="cab-height-input" />
                            </div>
                        </div>

                        {/* 2. Блок: Мої записи (РЕАЛЬНІ ДАНІ) */}
                        <div className="cab-card" data-aos="fade-up" style={{marginBottom: '30px'}}>
                            <h4 className="cab-title" style={{marginBottom: '20px'}}>МОЇ ТРЕНУВАННЯ</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {isBookingsLoading ? (
                                    <>
                                        <div className="skeleton-box" style={{height: '70px', borderRadius: '12px', background: 'var(--c-input)'}}></div>
                                        <div className="skeleton-box" style={{height: '70px', borderRadius: '12px', background: 'var(--c-input)'}}></div>
                                    </>
                                ) : bookings.length === 0 ? (
                                    <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--c-border)', textAlign: 'center', color: 'var(--c-text)', opacity: 0.6 }}>
                                        Ви ще не записані на жодне тренування. Перейдіть до Розкладу.
                                    </div>
                                ) : (
                                    bookings.map(b => (
                                        <div key={b.id} style={{ padding: '15px 20px', background: 'var(--c-input)', borderRadius: '12px', borderLeft: '4px solid #ff0000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <strong style={{ display: 'block', fontSize: '1.1rem', color: 'var(--c-text)' }}>{b.session?.class_name || 'Групове заняття'}</strong>
                                                <span style={{ fontSize: '0.85rem', color: '#888' }}>{new Date(b.session?.start_at).toLocaleString('uk-UA', { dateStyle: 'short', timeStyle: 'short' })}</span>
                                            </div>
                                            <div style={{ color: b.status === 'cancelled' ? '#888' : '#ff0000', fontWeight: '900', fontSize: '0.8rem', letterSpacing: '1px' }}>
                                                {getStatusLabel(b.status)}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* 3. Блок: Активність */}
                        <div className="cab-card" data-aos="fade-up" style={{marginBottom: '30px'}}>
                            <h4 className="cab-title">ЩОДЕННИК АКТИВНОСТІ</h4>
                            <div className="cab-chart">
                                {activity.map((h, i) => (
                                    <div key={i} className="cab-chart-col">
                                        <div className="cab-bar-track">
                                            <div className="cab-bar-fill" style={{height: `${h}%`}}></div>
                                        </div>
                                        <span className="cab-label">{['Пн','Вт','Ср','Чт','Пт','Сб','Нд'][i]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 4. Блок: Календар */}
                        <div className="cab-card" data-aos="fade-up">
                            <div className="cab-cal-nav">
                                <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))} className="cab-arrow">←</button>
                                <h4>{viewDate.toLocaleString('uk-UA', { month: 'long', year: 'numeric' }).toUpperCase()}</h4>
                                <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))} className="cab-arrow">→</button>
                            </div>
                            <div className="cab-cal-grid">
                                {['Пн','Вт','Ср','Чт','Пт','Сб','Нд'].map(d => <div key={d} className="cab-cal-head">{d}</div>)}
                                {getDaysArray().map((date, i) => {
                                    if (!date) return <div key={`empty-${i}`}></div>;
                                    const key = formatDateKey(date);
                                    const hasNote = userNotes[key];
                                    return (
                                        <div key={key} className={`cab-cal-day ${hasNote ? 'cab-active' : ''}`}
                                            onClick={() => { setActiveDayKey(key); setTempNote(userNotes[key] || ''); }}>
                                            <span>{date.getDate()}</span>
                                            {hasNote && <div className="cab-dot"></div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {activeDayKey && (
                <div className="cab-modal-overlay" onClick={() => setActiveDayKey(null)}>
                    <div className="cab-modal-content" onClick={e => e.stopPropagation()}>
                        <h5>ПЛАН: {activeDayKey.split('-').reverse().join('.')}</h5>
                        <input type="text" value={tempNote} onChange={e => setTempNote(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveNote()} placeholder="Назва тренування..." autoFocus />
                        <button className="cab-btn-save" onClick={handleSaveNote}>ЗБЕРЕГТИ ДАНІ</button>
                    </div>
                </div>
            )}

            <style>{`
                .cab-root.dark-mode {
                    --c-bg: #080808; --c-card: #121212; --c-input: #1a1a1a; --c-text: #ffffff; --c-border: #222;
                }
                .cab-root.light-mode {
                    --c-bg: #f5f5f7; --c-card: #ffffff; --c-input: #f0f0f2; --c-text: #1d1d1f; --c-border: #d2d2d7;
                }
                .cab-root { min-height: 100vh; padding: 100px 0; color: var(--c-text); position: relative; font-family: 'Inter', sans-serif; transition: 0.3s; }
                .cab-bg-layer { position: absolute; top:0; left:0; width:100%; height:100%; background: var(--c-bg); z-index: 1; transition: 0.3s; }
                .cab-relative { position: relative; z-index: 10; }
                .cab-grid { display: grid; grid-template-columns: 320px 1fr; gap: 30px; }
                .cab-sidebar, .cab-card { background: var(--c-card); border: 1px solid var(--c-border); border-radius: 24px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); transition: 0.3s; }
                
                .cab-avatar { width: 120px; height: 120px; border-radius: 50%; border: 3px solid #ff0000; margin: 0 auto 15px; background: url('https://img.freepik.com/free-photo/muscular-man-doing-exercises-with-dumbbells_155003-1849.jpg') center/cover; box-shadow: 0 0 20px rgba(255,0,0,0.3); }
                .cab-user-name { color: #ff0000; font-weight: 900; text-transform: uppercase; text-align: center; font-size: 1.4rem; line-height: 1.2;}
                .cab-badge { width: fit-content; margin: 10px auto; background: rgba(255,0,0,0.1); color: #ff0000; padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 800; border: 1px solid #ff0000; }
                
                .cab-input-box label { display: block; font-size: 0.65rem; color: #ff0000; font-weight: 900; margin-top: 15px; margin-bottom: 5px; }
                .cab-input-box input, .cab-height-input { background: var(--c-input); border: 1px solid var(--c-border); padding: 10px; color: var(--c-text); border-radius: 10px; outline: none; transition: 0.3s; width: 100%;}
                .cab-input-box input:focus, .cab-height-input:focus { border-color: #ff0000; box-shadow: 0 0 10px rgba(255,0,0,0.2); }
                .cab-height-input { width: 80px; text-align: center; font-weight: 900; margin-left: 10px; }

                .cab-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .cab-title { color: #ff0000; font-weight: 900; letter-spacing: 1px; margin: 0; }
                .cab-bmi { background: #ff0000; color: #fff; padding: 4px 12px; border-radius: 8px; font-weight: 900; font-size: 0.8rem; }
                
                .cab-params-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
                .cab-param-item { background: var(--c-input); padding: 20px; border-radius: 20px; border: 1px solid var(--c-border); }
                .cab-param-val { font-size: 2.5rem; font-weight: 900; }
                .cab-goal-input { background: transparent; border: none; font-size: 2.5rem; font-weight: 900; color: var(--c-text); width: 100px; outline: none; }
                .cab-slider { width: 100%; accent-color: #ff0000; cursor: pointer; }
                .cab-progress-track { height: 8px; background: rgba(0,0,0,0.1); border-radius: 10px; overflow: hidden; margin-top: 15px; }
                .cab-progress-fill { height: 100%; background: #ff0000; box-shadow: 0 0 10px #ff0000; transition: 0.5s; }

                .cab-chart { display: flex; justify-content: space-between; align-items: flex-end; height: 150px; padding: 10px 0; }
                .cab-chart-col { width: 12%; text-align: center; }
                .cab-bar-track { height: 120px; background: var(--c-input); border-radius: 10px; position: relative; overflow: hidden; }
                .cab-bar-fill { position: absolute; bottom: 0; width: 100%; background: #ff0000; filter: drop-shadow(0 0 8px #ff0000); transition: height 0.6s ease; }
                .cab-label { font-size: 0.7rem; color: #888; margin-top: 10px; display: block; font-weight: 800; }

                .cab-cal-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
                .cab-arrow { background: var(--c-input); border: 1px solid var(--c-border); color: var(--c-text); width: 45px; height: 45px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.3s; }
                .cab-arrow:hover { background: #ff0000; border-color: #ff0000; color: #fff; }
                .cab-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; }
                .cab-cal-head { text-align: center; font-size: 0.75rem; color: #ff0000; font-weight: 900; padding-bottom: 10px; }
                .cab-cal-day { aspect-ratio: 1; background: var(--c-input); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; border: 1px solid transparent; transition: 0.2s; }
                .cab-cal-day:hover { border-color: #ff0000; transform: translateY(-2px); }
                .cab-cal-day.cab-active { border-color: #ff0000; background: rgba(255,0,0,0.05); }
                .cab-dot { width: 6px; height: 6px; background: #ff0000; border-radius: 50%; margin-top: 4px; box-shadow: 0 0 10px #ff0000; }

                .cab-modal-overlay { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); }
                .cab-modal-content { background: var(--c-card); border: 1px solid #ff0000; padding: 40px; border-radius: 30px; width: 350px; text-align: center; }
                .cab-modal-content h5 { color: #ff0000; font-weight: 900; margin-bottom: 20px; }
                .cab-modal-content input { width: 100%; background: var(--c-input); border: 1px solid var(--c-border); padding: 15px; color: var(--c-text); border-radius: 12px; margin-bottom: 20px; outline: none; }
                .cab-btn-save { background: #ff0000; color: #fff; border: none; padding: 12px 30px; border-radius: 10px; font-weight: 900; cursor: pointer; width: 100%; }

                .cab-theme-toggle { position: fixed; top: 100px; right: 20px; z-index: 1000; background: var(--c-card); border: 1px solid #ff0000; color: #ff0000; padding: 10px 20px; border-radius: 12px; font-weight: 900; cursor: pointer; transition: 0.3s; }
                .cab-theme-toggle:hover { background: #ff0000; color: #fff; }
                .cab-logout-btn { width: 100%; background: transparent; border: 1px solid #ff0000; color: #ff0000; padding: 12px; border-radius: 12px; margin-top: 25px; font-weight: 900; cursor: pointer; transition: 0.3s; }
                .cab-logout-btn:hover { background: #ff0000; color: #fff; }

                @media (max-width: 992px) {
                    .cab-grid { grid-template-columns: 1fr; }
                    .cab-theme-toggle { top: 80px; }
                }
            `}</style>
        </section>
    );
}