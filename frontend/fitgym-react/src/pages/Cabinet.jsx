import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useUI } from '../context/UIContext';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Імпорт наших нових чистих модулів
import CabinetSidebar from '../components/cabinet/CabinetSidebar';
import Biometrics from '../components/cabinet/Biometrics';
import MyBookings from '../components/cabinet/MyBookings';

export default function Cabinet() {
    const { addToast } = useUI();

    // Тема залишається на рівні сторінки, бо огортає все
    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('gym_theme') !== 'light');
    
    useEffect(() => {
        localStorage.setItem('gym_theme', isDarkMode ? 'dark' : 'light');
        AOS.init({ duration: 800, once: true });
    }, [isDarkMode]);

    // Спільний стан для Графіку та Календаря
    const [userNotes, setUserNotes] = useState(() => JSON.parse(localStorage.getItem('gym_notes')) || {});
    const [activity, setActivity] = useState([15, 15, 15, 15, 15, 15, 15]);
    const [viewDate, setViewDate] = useState(new Date());
    const [activeDayKey, setActiveDayKey] = useState(null);
    const [tempNote, setTempNote] = useState('');

    const formatDateKey = (date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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
            if (notes[formatDateKey(checkDate)]?.trim() !== "") newActivity[i] = 100;
        }
        setActivity(newActivity);
    }, []);

    useEffect(() => {
        refreshActivityChart(userNotes);
        localStorage.setItem('gym_notes', JSON.stringify(userNotes));
    }, [refreshActivityChart, userNotes]);

    const handleSaveNote = () => {
        setUserNotes({ ...userNotes, [activeDayKey]: tempNote });
        setActiveDayKey(null);
        addToast('План збережено!', 'success');
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

    return (
        <section className={`cab-root min-h-screen py-[100px] relative font-sans transition-colors duration-300 bg-[var(--c-bg)] text-[var(--c-text)] ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
            
            <div className="container mx-auto px-5 lg:px-8 relative z-10">
                <button 
                    className="fixed top-[80px] lg:top-[100px] right-[20px] z-[1000] px-5 py-2.5 rounded-xl border border-primary text-primary font-black uppercase transition-colors duration-300 hover:bg-primary hover:text-white bg-[var(--c-card)] shadow-lg"
                    onClick={() => setIsDarkMode(!isDarkMode)}
                >
                    {isDarkMode ? '🌙 DARK' : '☀️ LIGHT'}
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-[30px] items-start">
                    
                    <CabinetSidebar />

                    <main className="min-w-0">
                        <Biometrics />
                        <MyBookings />

                        {/* Блок: Активність */}
                        <div className="p-[20px] sm:p-[30px] rounded-[24px] border border-[var(--c-border)] shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-colors duration-300 mb-[30px] bg-[var(--c-card)]" data-aos="fade-up">
                            <h4 className="text-primary font-black tracking-[1px] mb-[20px]">ЩОДЕННИК АКТИВНОСТІ</h4>
                            <div className="flex justify-between items-end h-[150px] py-[10px]">
                                {activity.map((h, i) => (
                                    <div key={i} className="w-[12%] text-center">
                                        <div className="h-[120px] rounded-[10px] relative overflow-hidden bg-[var(--c-input)]">
                                            <div className="absolute bottom-0 left-0 w-full bg-primary shadow-[0_0_8px_#ff0000] transition-all duration-600" style={{height: `${h}%`}}></div>
                                        </div>
                                        <span className="block text-[0.7rem] text-[#888] font-extrabold mt-2.5">{['Пн','Вт','Ср','Чт','Пт','Сб','Нд'][i]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Блок: Календар */}
                        <div className="p-[20px] sm:p-[30px] rounded-[24px] border border-[var(--c-border)] shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-colors duration-300 bg-[var(--c-card)]" data-aos="fade-up">
                            <div className="flex justify-between items-center mb-[25px]">
                                <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))} className="w-[45px] h-[45px] rounded-xl border border-[var(--c-border)] bg-[var(--c-input)] flex items-center justify-center cursor-pointer transition-colors hover:bg-primary hover:text-white hover:border-primary">←</button>
                                <h4 className="font-bold m-0">{viewDate.toLocaleString('uk-UA', { month: 'long', year: 'numeric' }).toUpperCase()}</h4>
                                <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))} className="w-[45px] h-[45px] rounded-xl border border-[var(--c-border)] bg-[var(--c-input)] flex items-center justify-center cursor-pointer transition-colors hover:bg-primary hover:text-white hover:border-primary">→</button>
                            </div>
                            <div className="grid grid-cols-7 gap-1 md:gap-2.5">
                                {['Пн','Вт','Ср','Чт','Пт','Сб','Нд'].map(d => <div key={d} className="text-center text-[0.75rem] text-primary font-black pb-2.5">{d}</div>)}
                                {getDaysArray().map((date, i) => {
                                    if (!date) return <div key={`empty-${i}`}></div>;
                                    const key = formatDateKey(date);
                                    const hasNote = userNotes[key];
                                    return (
                                        <div key={key} 
                                            className={`aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer border transition-all duration-200 hover:-translate-y-0.5 bg-[var(--c-input)] ${hasNote ? 'border-primary bg-primary/10' : 'border-transparent hover:border-primary'}`}
                                            onClick={() => { setActiveDayKey(key); setTempNote(userNotes[key] || ''); }}
                                        >
                                            <span className="font-semibold text-[0.9rem] sm:text-[1rem]">{date.getDate()}</span>
                                            {hasNote && <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1 shadow-[0_0_10px_#ff0000]"></div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {/* Портал для модалки нотаток */}
            {activeDayKey && createPortal(
                <div className="fixed inset-0 w-screen h-screen z-[100000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setActiveDayKey(null)}>
                    <div className="p-[40px] rounded-[30px] border border-primary w-full max-w-[350px] text-center bg-[var(--c-card)] text-[var(--c-text)]" onClick={e => e.stopPropagation()}>
                        <h5 className="text-primary font-black mb-[20px] text-[1.2rem]">ПЛАН: {activeDayKey.split('-').reverse().join('.')}</h5>
                        <input 
                            type="text" 
                            value={tempNote} 
                            onChange={e => setTempNote(e.target.value)} 
                            onKeyDown={e => e.key === 'Enter' && handleSaveNote()} 
                            placeholder="Назва тренування..." 
                            autoFocus 
                            className="w-full p-[15px] rounded-xl border border-[var(--c-border)] bg-[var(--c-input)] text-[var(--c-text)] mb-[20px] outline-none focus:border-primary"
                        />
                        <button 
                            className="w-full p-[12px_30px] bg-primary text-white rounded-xl font-black cursor-pointer shadow-[0_5px_15px_rgba(255,0,0,0.3)] hover:-translate-y-1 transition-all hover:bg-[#cc0000]" 
                            onClick={handleSaveNote}
                        >
                            ЗБЕРЕГТИ ДАНІ
                        </button>
                    </div>
                </div>,
                document.body
            )}

            <style>{`
                .cab-root.dark-mode { --c-bg: #080808; --c-card: #121212; --c-input: #1a1a1a; --c-text: #ffffff; --c-border: #222222; }
                .cab-root.light-mode { --c-bg: #f5f5f7; --c-card: #ffffff; --c-input: #f0f0f2; --c-text: #1d1d1f; --c-border: #d2d2d7; }
            `}</style>
        </section>
    );
}