import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { authRequest } from '../utils/api';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Cabinet() {
    const { user, logout } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Стан даних користувача (пріоритет: localStorage -> дані з контексту -> дефолт)
    const [firstName, setFirstName] = useState(() => localStorage.getItem('gym_fname') || user?.first_name || 'Поліна');
    const [lastName, setLastName] = useState(() => localStorage.getItem('gym_lname') || user?.last_name || 'Товстуха');
    const [email, setEmail] = useState(() => localStorage.getItem('gym_email') || user?.email || 'polina.t@fitgym.com');
    
    const [activity, setActivity] = useState(() => JSON.parse(localStorage.getItem('gym_activity')) || [30, 50, 45, 80, 60, 20, 70]);
    const [userNotes, setUserNotes] = useState(() => JSON.parse(localStorage.getItem('gym_notes')) || {});
    
    const [avatar, setAvatar] = useState('/img/муж1.png');
    const [activeDay, setActiveDay] = useState(null);
    const [tempNote, setTempNote] = useState('');
    const fileInputRef = useRef(null);

    // Автоматичне збереження локальних змін
    useEffect(() => {
        localStorage.setItem('gym_fname', firstName);
        localStorage.setItem('gym_lname', lastName);
        localStorage.setItem('gym_email', email);
        localStorage.setItem('gym_activity', JSON.stringify(activity));
        localStorage.setItem('gym_notes', JSON.stringify(userNotes));
    }, [firstName, lastName, email, activity, userNotes]);

    useEffect(() => {
        AOS.init({ duration: 800 });
        loadSchedule();
    }, []);

    const loadSchedule = async () => {
        try {
            const data = await authRequest('/api/my-bookings/');
            setBookings(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleActivityChange = (index, e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const heightPercent = Math.round(((rect.bottom - e.clientY) / rect.height) * 100);
        const newActivity = [...activity];
        newActivity[index] = Math.max(5, Math.min(100, heightPercent));
        setActivity(newActivity);
    };

    const saveNote = () => {
        setUserNotes({ ...userNotes, [activeDay]: tempNote });
        setActiveDay(null);
    };

    return (
        <section className="ultimate-glass-cabinet">
            <div className="bg-image-layer"></div>
            
            <div className="container position-relative z-3">
                <div className="cabinet-grid">
                    
                    {/* ЛІВА ПАНЕЛЬ: ПРОФІЛЬ ТА КЕРУВАННЯ */}
                    <aside className="glass-aside" data-aos="fade-right">
                        <div className="profile-top text-center">
                            <div className="avatar-circle-red" onClick={() => fileInputRef.current.click()}>
                                <img src={avatar} alt="User" />
                                <input type="file" ref={fileInputRef} hidden onChange={(e) => setAvatar(URL.createObjectURL(e.target.files[0]))} />
                            </div>
                            
                            <h2 className="user-fullname-red">{firstName} <br/> {lastName}</h2>
                            <p className="user-email-text">{email}</p>
                            
                            <div className="subscription-status">
                                <span className="status-dot"></span> PRO MEMBER
                            </div>
                        </div>

                        <div className="edit-section">
                            <div className="glass-field">
                                <label>ІМ'Я</label>
                                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                            </div>
                            <div className="glass-field">
                                <label>ПРІЗВИЩЕ</label>
                                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                            </div>
                            <div className="glass-field">
                                <label>EMAIL АДРЕСА</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                        </div>

                        <button onClick={logout} className="logout-glass-btn">ВИЙТИ З АКАУНТУ</button>
                    </aside>

                    {/* ПРАВА ПАНЕЛЬ: КОНТЕНТ */}
                    <main className="main-glass-content">
                        
                        {/* ГРУПОВІ ЗАНЯТТЯ */}
                        <div className="glass-card mb-4" data-aos="fade-up">
                            <h4 className="title-tech">Групові тренування (Записи)</h4>
                            <div className="bookings-flex">
                                {loading ? <p>Завантаження...</p> : bookings.length === 0 ? (
                                    <p className="no-data-text">Ви ще не записані на групові заняття.</p>
                                ) : (
                                    bookings.map(item => (
                                        <div key={item.id} className="booking-glass-item">
                                            <div className="b-date">{new Date(item.session?.start_at).getDate()}</div>
                                            <div className="b-info">
                                                <h5>{item.session?.class_name}</h5>
                                                <small>{item.session?.instructor_name} • {new Date(item.session?.start_at).getHours()}:00</small>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* АКТИВНІСТЬ */}
                        <div className="glass-card mb-4" data-aos="fade-up">
                            <h4 className="title-tech">Тижнева активність</h4>
                            <div className="chart-glass-container">
                                {activity.map((h, i) => (
                                    <div key={i} className="chart-column">
                                        <div className="bar-track-glass" onClick={(e) => handleActivityChange(i, e)}>
                                            <div className="bar-fill-red" style={{height: `${h}%`}}></div>
                                        </div>
                                        <span className="bar-label">{['Пн','Вт','Ср','Чт','Пт','Сб','Нд'][i]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* КАЛЕНДАР */}
                        <div className="glass-card" data-aos="fade-up">
                            <h4 className="title-tech">Календар тренувань</h4>
                            <div className="calendar-glass-grid">
                                {['Пн','Вт','Ср','Чт','Пт','Сб','Нд'].map(d => <div key={d} className="calendar-header-day">{d}</div>)}
                                {[...Array(35)].map((_, i) => {
                                    const day = i - 2; 
                                    if (day <= 0 || day > 30) return <div key={i}></div>;
                                    return (
                                        <div key={i} className={`cal-glass-cell ${userNotes[day] ? 'active' : ''}`} onClick={() => {setActiveDay(day); setTempNote(userNotes[day] || '');}}>
                                            <span className="day-number">{day}</span>
                                            {userNotes[day] && <div className="note-text-inside">{userNotes[day]}</div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {/* ВСПЛИВАЮЧЕ ВІКНО */}
            {activeDay && (
                <div className="glass-modal-overlay">
                    <div className="glass-popup">
                        <h5>Запис на {activeDay} число</h5>
                        <input type="text" value={tempNote} onChange={(e)=>setTempNote(e.target.value)} placeholder="Введіть ваше тренування..." />
                        <div className="popup-buttons">
                            <button className="btn-save-red" onClick={saveNote}>Зберегти</button>
                            <button className="btn-close-glass" onClick={()=>setActiveDay(null)}>Закрити</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .ultimate-glass-cabinet { min-height: 100vh; padding: 100px 0; color: #fff; position: relative; }
                .bg-image-layer { 
                    position: absolute; top:0; left:0; width:100%; height:100%; 
                    background: linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.85)), url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070') center/cover;
                    z-index: 1; backdrop-filter: blur(15px);
                }
                .cabinet-grid { display: grid; grid-template-columns: 320px 1fr; gap: 30px; position: relative; z-index: 5; }

                /* GLASS PANELS */
                .glass-aside, .glass-card { 
                    background: rgba(255, 255, 255, 0.03); 
                    backdrop-filter: blur(25px); 
                    border: 1px solid rgba(255, 255, 255, 0.08); 
                    border-radius: 30px; padding: 35px;
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                }

                /* PROFILE & EMAIL */
                .avatar-circle-red { width: 130px; height: 130px; border-radius: 50%; border: 3px solid #ff0000; margin: 0 auto 20px; overflow: hidden; cursor: pointer; box-shadow: 0 0 25px rgba(255,0,0,0.4); transition: 0.3s; }
                .avatar-circle-red:hover { transform: scale(1.05); }
                .avatar-circle-red img { width: 100%; height: 100%; object-fit: cover; }
                
                .user-fullname-red { color: #ff0000; font-weight: 900; text-transform: uppercase; font-size: 1.5rem; line-height: 1.1; margin-bottom: 5px; text-shadow: 0 0 10px rgba(255,0,0,0.2); }
                .user-email-text { font-size: 0.8rem; color: rgba(255,255,255,0.4); margin-bottom: 20px; font-family: 'Courier New', monospace; }
                
                .subscription-status { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,0,0,0.1); border: 1px solid #ff0000; padding: 5px 15px; border-radius: 20px; font-size: 0.7rem; font-weight: 900; color: #ff0000; letter-spacing: 1px; margin-bottom: 30px; }
                .status-dot { width: 6px; height: 6px; background: #ff0000; border-radius: 50%; box-shadow: 0 0 8px #ff0000; animation: pulse 1.5s infinite; }

                @keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }

                /* FORM FIELDS */
                .glass-field { margin-bottom: 15px; }
                .glass-field label { display: block; font-size: 0.65rem; font-weight: 900; color: #ff0000; margin-bottom: 6px; letter-spacing: 1px; opacity: 0.8; }
                .glass-field input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 12px; color: #fff; border-radius: 12px; outline: none; transition: 0.3s; }
                .glass-field input:focus { border-color: #ff0000; background: rgba(255,255,255,0.1); }
                
                .logout-glass-btn { width: 100%; background: none; border: 1px solid #ff0000; color: #ff0000; padding: 12px; border-radius: 15px; font-weight: 900; cursor: pointer; transition: 0.3s; margin-top: 10px; }
                .logout-glass-btn:hover { background: #ff0000; color: #fff; box-shadow: 0 0 20px rgba(255,0,0,0.4); }

                /* TITLES */
                .title-tech { font-size: 1rem; font-weight: 900; text-transform: uppercase; border-left: 5px solid #ff0000; padding-left: 15px; margin-bottom: 30px; letter-spacing: 1px; }

                /* CHART & CALENDAR (STYLES REMAIN SAME AS YOURS) */
                .chart-glass-container { display: flex; justify-content: space-between; align-items: flex-end; height: 130px; }
                .chart-column { width: 12%; text-align: center; }
                .bar-track-glass { height: 100px; background: rgba(255,255,255,0.02); border-radius: 8px; position: relative; overflow: hidden; cursor: crosshair; }
                .bar-fill-red { position: absolute; bottom: 0; width: 100%; background: #ff0000; box-shadow: 0 0 15px #ff0000; transition: height 0.3s; }
                .bar-label { font-size: 0.7rem; color: #666; margin-top: 10px; display: block; font-weight: 800; }

                .calendar-glass-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; }
                .calendar-header-day { text-align: center; font-size: 0.7rem; color: #ff0000; font-weight: 900; }
                .cal-glass-cell { aspect-ratio: 1.1; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 15px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; position: relative; }
                .cal-glass-cell:hover { background: rgba(255,0,0,0.1); border-color: #ff0000; }
                .cal-glass-cell.active { background: rgba(255,0,0,0.2); border-color: #ff0000; }
                .day-number { font-weight: 900; font-size: 1rem; }
                .note-text-inside { font-size: 0.5rem; color: #ff0000; font-weight: 800; margin-top: 5px; text-align: center; }

                .glass-modal-overlay { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px); z-index: 1000; display: flex; align-items: center; justify-content: center; }
                .glass-popup { background: rgba(20,20,20,0.9); border: 1px solid #ff0000; padding: 35px; border-radius: 30px; width: 350px; text-align: center; }
                .btn-save-red { flex: 1; background: #ff0000; color: #fff; border: none; padding: 12px; border-radius: 10px; font-weight: 900; cursor: pointer; }
                .btn-close-glass { flex: 1; background: #222; color: #888; border: none; padding: 12px; border-radius: 10px; font-weight: 900; cursor: pointer; }

                .booking-glass-item { display: flex; align-items: center; gap: 15px; background: rgba(255,255,255,0.03); padding: 15px; border-radius: 20px; border-left: 4px solid #ff0000; }
                .b-date { font-size: 1.5rem; font-weight: 900; color: #ff0000; }
                
                @media (max-width: 950px) { .cabinet-grid { grid-template-columns: 1fr; } }
            `}</style>
        </section>
    );
}