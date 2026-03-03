import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import AOS from 'aos';
import 'aos/dist/aos.css';

import CabinetSidebar from '../components/cabinet/CabinetSidebar';
import CabinetOverview from '../components/cabinet/CabinetOverview';
import Biometrics from '../components/cabinet/Biometrics';
import MyBookings from '../components/cabinet/MyBookings';
import CabinetSettings from '../components/cabinet/CabinetSettings';

export default function Cabinet() {
    const { addToast } = useUI();
    const { user } = useAuth();

    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('gym_theme') !== 'light');
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        localStorage.setItem('gym_theme', isDarkMode ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', isDarkMode);
        AOS.init({ duration: 800, once: true });
    }, [isDarkMode]);

    // Спільний стан для Графіку та Календаря (потрібен для CabinetOverview)
    const [userNotes, setUserNotes] = useState(() => JSON.parse(localStorage.getItem('gym_notes')) || {});
    const [activity, setActivity] = useState([15, 15, 15, 15, 15, 15, 15]);
    const [viewDate, setViewDate] = useState(new Date());
    const [activeDayKey, setActiveDayKey] = useState(null);
    const [tempNote, setTempNote] = useState('');

    // Biometrics states (we can lift them here to share with Overview or keep them local. We'll lift them to share)
    const [weight, setWeight] = useState(() => Number(localStorage.getItem('gym_weight')) || 85);
    const [height, setHeight] = useState(() => Number(localStorage.getItem('gym_height')) || 180);
    const [goal, setGoal] = useState(() => Number(localStorage.getItem('gym_goal')) || 90);

    useEffect(() => {
        localStorage.setItem('gym_weight', weight);
        localStorage.setItem('gym_height', height);
        localStorage.setItem('gym_goal', goal);
    }, [weight, height, goal]);

    const bmi = height > 0 ? (weight / ((height / 100) ** 2)).toFixed(1) : 0;
    const progressToGoal = Math.min(100, Math.round((weight / goal) * 100));

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
                    className="fixed top-[80px] lg:top-[100px] right-[20px] z-[1000] px-5 py-2.5 rounded-xl border border-[var(--c-border)] text-[var(--c-text)] font-black uppercase transition-colors duration-300 hover:bg-primary hover:text-white hover:border-primary bg-[var(--c-card)] shadow-lg text-[0.8rem]"
                    onClick={() => setIsDarkMode(!isDarkMode)}
                >
                    {isDarkMode ? '🌙 СВІТЛА ТЕМА' : '☀️ ТЕМНА ТЕМА'}
                </button>

                {/* Using a grid layout similar to before but adapted for new Sidebar flow */}
                <div className="flex flex-col lg:flex-row gap-[30px] items-start">

                    <div className="w-full lg:w-[320px] flex-shrink-0">
                        <CabinetSidebar activeTab={activeTab} onTabChange={setActiveTab} />
                    </div>

                    <main className="flex-1 min-w-0 w-full bg-[var(--c-bg)]">
                        {activeTab === "overview" && (
                            <CabinetOverview
                                user={user}
                                activity={activity}
                                viewDate={viewDate}
                                setViewDate={setViewDate}
                                getDaysArray={getDaysArray}
                                userNotes={userNotes}
                                formatDateKey={formatDateKey}
                                setActiveDayKey={setActiveDayKey}
                                setTempNote={setTempNote}
                                weight={weight}
                                bmi={bmi}
                                progressToGoal={progressToGoal}
                            />
                        )}
                        {activeTab === "bookings" && <MyBookings />}
                        {activeTab === "biometrics" && (
                            <Biometrics
                                weight={weight} setWeight={setWeight}
                                height={height} setHeight={setHeight}
                                goal={goal} setGoal={setGoal}
                                bmi={bmi} progressToGoal={progressToGoal}
                            />
                        )}
                        {activeTab === "settings" && <CabinetSettings user={user} />}
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
                            className="w-full p-[15px] rounded-xl border border-[var(--c-border)] bg-[var(--c-input)] text-[var(--c-text)] mb-[20px] outline-none focus:border-primary font-bold"
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
                
                /* Extra util classes for new UI text gradients */
                .text-gradient-primary {
                    background: linear-gradient(to right, #ff0000, #cc0000);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            `}</style>
        </section>
    );
}