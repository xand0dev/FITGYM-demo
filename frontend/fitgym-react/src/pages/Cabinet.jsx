import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { authRequest } from '../utils/api';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Cabinet() {
    const { user, logout } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Дані профілю
    const [firstName, setFirstName] = useState(() => localStorage.getItem('gym_fname') || user?.first_name || 'Поліна');
    const [lastName, setLastName] = useState(() => localStorage.getItem('gym_lname') || user?.last_name || 'Товстуха');
    const [email, setEmail] = useState(() => localStorage.getItem('gym_email') || user?.email || 'polina.t@fitgym.com');
    
    // Нотатки та активність
    const [userNotes, setUserNotes] = useState(() => JSON.parse(localStorage.getItem('gym_notes')) || {});
    const [activity, setActivity] = useState([10, 10, 10, 10, 10, 10, 10]);
    
    const [avatar, setAvatar] = useState('/img/муж1.png');
    const [activeDayKey, setActiveDayKey] = useState(null);
    const [tempNote, setTempNote] = useState('');
    const fileInputRef = useRef(null);

    // Функція форматування дати в локальний ключ YYYY-MM-DD без зсуву часового поясу
    const formatDateKey = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // 1. АВТОМАТИЧНЕ ОЧИЩЕННЯ ТА СИНХРОНІЗАЦІЯ ГРАФІКА
    useEffect(() => {
        const now = new Date();
        
        // Видаляємо нотатки, старіші за 30 днів
        const cleanedNotes = { ...userNotes };
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        
        Object.keys(cleanedNotes).forEach(key => {
            if (new Date(key) < thirtyDaysAgo) delete cleanedNotes[key];
        });

        // Розрахунок поточного тижня (Пн-Нд)
        const currentDay = now.getDay();
        const diffToMonday = currentDay === 0 ? 6 : currentDay - 1;
        const monday = new Date(now);
        monday.setDate(now.getDate() - diffToMonday);
        monday.setHours(0, 0, 0, 0);

        const newActivity = [10, 10, 10, 10, 10, 10, 10];
        for (let i = 0; i < 7; i++) {
            const checkDate = new Date(monday);
            checkDate.setDate(monday.getDate() + i);
            const key = formatDateKey(checkDate);
            if (cleanedNotes[key] && cleanedNotes[key].trim() !== "") {
                newActivity[i] = 95; // Висота стовпчика
            }
        }

        setActivity(newActivity);
        localStorage.setItem('gym_notes', JSON.stringify(cleanedNotes));
        localStorage.setItem('gym_fname', firstName);
        localStorage.setItem('gym_lname', lastName);
        localStorage.setItem('gym_email', email);
    }, [userNotes, firstName, lastName, email]);

    useEffect(() => {
        AOS.init({ duration: 800 });
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const data = await authRequest('/api/my-bookings/');
            setBookings(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const getDaysArray = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const days = [];
        let startDay = start.getDay();
        let blanks = startDay === 0 ? 6 : startDay - 1;
        for (let i = 0; i < blanks; i++) days.push(null);
        for (let d = 1; d <= end.getDate(); d++) days.push(new Date(now.getFullYear(), now.getMonth(), d));
        return days;
    };

    const saveNote = () => {
        setUserNotes(prev => ({ ...prev, [activeDayKey]: tempNote }));
        setActiveDayKey(null);
    };

    return (
        <section className="ultimate-glass-cabinet">
            <div className="bg-image-layer"></div>
            <div className="container position-relative z-3">
                <div className="cabinet-grid">
                    
                    <aside className="glass-aside" data-aos="fade-right">
                        <div className="profile-top text-center">
                            <div className="avatar-circle-red" onClick={() => fileInputRef.current.click()}>
                                <img src={avatar} alt="User" />
                                <input type="file" ref={fileInputRef} hidden onChange={(e) => setAvatar(URL.createObjectURL(e.target.files[0]))} />
                            </div>
                            <h2 className="user-fullname-red">{firstName} <br/> {lastName}</h2>
                            <p className="user-email-text">{email}</p>
                            <div className="subscription-status"><span className="status-dot"></span> PRO MEMBER</div>
                        </div>
                        <div className="edit-section">
                            <div className="glass-field"><label>ІМ'Я</label><input type="text" value={firstName} onChange={(e)=>setFirstName(e.target.value)} /></div>
                            <div className="glass-field"><label>ПРІЗВИЩЕ</label><input type="text" value={lastName} onChange={(e)=>setLastName(e.target.value)} /></div>
                            <div className="glass-field"><label>EMAIL</label><input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} /></div>
                        </div>
                        <button onClick={logout} className="logout-glass-btn">ВИЙТИ</button>
                    </aside>

                    <main className="main-glass-content">
                        <div className="glass-card mb-4" data-aos="fade-up">
                            <h4 className="title-tech">Тижнева активність</h4>
                            <div className="chart-glass-container">
                                {activity.map((h, i) => (
                                    <div key={i} className="chart-column">
                                        <div className="bar-track-glass"><div className="bar-fill-red" style={{height: `${h}%`}}></div></div>
                                        <span className="bar-label">{['Пн','Вт','Ср','Чт','Пт','Сб','Нд'][i]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card" data-aos="fade-up">
                            <h4 className="title-tech">Календар: {new Date().toLocaleString('uk-UA', { month: 'long' })}</h4>
                            <div className="calendar-glass-grid">
                                {['Пн','Вт','Ср','Чт','Пт','Сб','Нд'].map(d => <div key={d} className="calendar-header-day">{d}</div>)}
                                {getDaysArray().map((date, i) => {
                                    if (!date) return <div key={`b-${i}`}></div>;
                                    const key = formatDateKey(date);
                                    const hasNote = userNotes[key] && userNotes[key].trim() !== "";
                                    return (
                                        <div key={key} className={`cal-glass-cell ${hasNote ? 'active' : ''}`} 
                                             onClick={() => { setActiveDayKey(key); setTempNote(userNotes[key] || ''); }}>
                                            <span className="day-number">{date.getDate()}</span>
                                            {hasNote && <div className="note-dot"></div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {activeDayKey && (
                <div className="glass-modal-overlay" onClick={() => setActiveDayKey(null)}>
                    <div className="glass-popup" onClick={e => e.stopPropagation()}>
                        <h5>План на {activeDayKey.split('-').reverse().join('.')}</h5>
                        <input type="text" value={tempNote} onChange={(e)=>setTempNote(e.target.value)} placeholder="Що сьогодні?" autoFocus />
                        <div className="popup-buttons">
                            <button className="btn-save-red" onClick={saveNote}>Зберегти</button>
                            <button className="btn-close-glass" onClick={()=>setActiveDayKey(null)}>Скасувати</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .ultimate-glass-cabinet { min-height: 100vh; padding: 100px 0; color: #fff; position: relative; }
                .bg-image-layer { position: absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.9)), url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070') center/cover; z-index: 1; backdrop-filter: blur(15px); }
                .cabinet-grid { display: grid; grid-template-columns: 320px 1fr; gap: 30px; position: relative; z-index: 5; }
                .glass-aside, .glass-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(25px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 25px; padding: 30px; }
                .avatar-circle-red { width: 120px; height: 120px; border-radius: 50%; border: 3px solid #ff0000; margin: 0 auto 15px; overflow: hidden; box-shadow: 0 0 20px rgba(255,0,0,0.4); cursor: pointer; }
                .user-fullname-red { color: #ff0000; font-weight: 900; text-transform: uppercase; font-size: 1.4rem; line-height: 1.1; }
                .subscription-status { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,0,0,0.1); border: 1px solid #ff0000; padding: 5px 15px; border-radius: 20px; font-size: 0.7rem; color: #ff0000; font-weight: 800; margin-top: 10px; }
                .status-dot { width: 6px; height: 6px; background: #ff0000; border-radius: 50%; box-shadow: 0 0 8px #ff0000; }
                .glass-field label { display: block; font-size: 0.65rem; color: #ff0000; font-weight: 900; margin-top: 15px; margin-bottom: 5px; }
                .glass-field input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid #333; padding: 10px; color: #fff; border-radius: 10px; outline: none; }
                .logout-glass-btn { width: 100%; background: transparent; border: 1px solid #ff0000; color: #ff0000; padding: 12px; border-radius: 15px; margin-top: 25px; font-weight: 900; cursor: pointer; }
                .title-tech { font-size: 1rem; font-weight: 900; text-transform: uppercase; border-left: 5px solid #ff0000; padding-left: 15px; margin-bottom: 30px; }
                .chart-glass-container { display: flex; justify-content: space-between; align-items: flex-end; height: 120px; padding: 0 10px; }
                .bar-track-glass { height: 100px; width: 35px; background: rgba(255,255,255,0.03); border-radius: 6px; position: relative; overflow: hidden; }
                .bar-fill-red { position: absolute; bottom: 0; width: 100%; background: #ff0000; box-shadow: 0 0 15px #ff0000; transition: height 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                .bar-label { font-size: 0.7rem; color: #888; margin-top: 10px; display: block; font-weight: 800; text-align: center; }
                .calendar-glass-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; }
                .calendar-header-day { text-align: center; font-size: 0.7rem; color: #ff0000; font-weight: 900; padding-bottom: 10px; }
                .cal-glass-cell { aspect-ratio: 1; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 15px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; }
                .cal-glass-cell.active { border-color: #ff0000; background: rgba(255,0,0,0.1); box-shadow: inset 0 0 10px rgba(255,0,0,0.2); }
                .note-dot { width: 6px; height: 6px; background: #ff0000; border-radius: 50%; margin-top: 4px; box-shadow: 0 0 8px #ff0000; }
                .glass-modal-overlay { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); z-index: 1000; display: flex; align-items: center; justify-content: center; }
                .glass-popup { background: #111; border: 1px solid #ff0000; padding: 30px; border-radius: 25px; width: 320px; text-align: center; }
                .glass-popup input { width: 100%; background: #222; border: 1px solid #333; padding: 12px; color: #fff; border-radius: 10px; margin: 15px 0; outline: none; }
                .popup-buttons { display: flex; gap: 10px; }
                .btn-save-red { flex: 1; background: #ff0000; color: #fff; border: none; padding: 10px; border-radius: 8px; font-weight: 900; cursor: pointer; }
                .btn-close-glass { flex: 1; background: #333; color: #888; border: none; padding: 10px; border-radius: 8px; font-weight: 900; cursor: pointer; }
            `}</style>
        </section>
    );
}