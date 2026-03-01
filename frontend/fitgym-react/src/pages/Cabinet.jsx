import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useAuthData, useFitMutation } from '../hooks/useFitQuery'; 
import { useQueryClient } from '@tanstack/react-query';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Cabinet() {
    const { user, logout } = useAuth();
    const { addToast, confirmAction } = useUI();
    const queryClient = useQueryClient();
    
    // Мутація для скасування запису
    const cancelMutation = useFitMutation('DELETE');

    // --- 1. ЛОГІКА ТЕМИ ---
    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('gym_theme') !== 'light');
    useEffect(() => {
        localStorage.setItem('gym_theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    // Tailwind стилі для світлої/темної теми
    const theme = {
        bg: isDarkMode ? 'bg-[#080808]' : 'bg-[#f5f5f7]',
        card: isDarkMode ? 'bg-[#121212]' : 'bg-[#ffffff]',
        input: isDarkMode ? 'bg-[#1a1a1a]' : 'bg-[#f0f0f2]',
        text: isDarkMode ? 'text-[#ffffff]' : 'text-[#1d1d1f]',
        border: isDarkMode ? 'border-[#222222]' : 'border-[#d2d2d7]',
    };

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
    const { data: bookings = [], isLoading: isBookingsLoading } = useAuthData('my-bookings', '/api/my-bookings/');

    // Логіка скасування запису
    const handleCancelBooking = (bookingId) => {
        confirmAction(
            "Ви впевнені, що хочете скасувати цей запис на тренування?",
            () => {
                cancelMutation.mutate(
                    { endpoint: `/api/my-bookings/${bookingId}/` },
                    {
                        onSuccess: () => {
                            if (addToast) addToast('Запис успішно скасовано!', 'success');
                            queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
                        },
                        onError: (error) => {
                            if (addToast) addToast(error.message || 'Помилка при скасуванні', 'error');
                        }
                    }
                );
            }
        );
    };

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
        <section className={`min-h-screen py-[100px] relative font-sans transition-colors duration-300 ${theme.bg} ${theme.text}`}>
            
            <div className="container mx-auto px-5 lg:px-8 relative z-10">
                <button 
                    className={`fixed top-[80px] lg:top-[100px] right-[20px] z-[1000] px-5 py-2.5 rounded-xl border border-primary text-primary font-black uppercase transition-colors duration-300 hover:bg-primary hover:text-white ${theme.card}`}
                    onClick={() => setIsDarkMode(!isDarkMode)}
                >
                    {isDarkMode ? '🌙 DARK' : '☀️ LIGHT'}
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-[30px]">
                    
                    {/* --- САЙДБАР --- */}
                    <aside className={`p-[30px] rounded-[24px] border shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-colors duration-300 ${theme.card} ${theme.border}`} data-aos="fade-right">
                        <div className="text-center mb-[20px]">
                            <div className="w-[120px] h-[120px] rounded-full border-[3px] border-primary mx-auto mb-[15px] bg-[url('https://img.freepik.com/free-photo/muscular-man-doing-exercises-with-dumbbells_155003-1849.jpg')] bg-center bg-cover shadow-[0_0_20px_rgba(255,0,0,0.3)]"></div>
                            <h2 className="text-primary font-black uppercase text-[1.4rem] leading-[1.2]">{firstName} <br/> {lastName}</h2>
                            <div className="inline-block mt-2.5 px-3 py-1 bg-primary/10 text-primary border border-primary rounded-full text-[0.7rem] font-extrabold">
                                {user?.is_superuser ? 'АДМІНІСТРАТОР' : (user?.is_staff ? 'ТРЕНЕР' : 'PRO MEMBER')}
                            </div>
                        </div>

                        <div>
                            <div className="mb-[15px]">
                                <label className="block text-[0.65rem] text-primary font-black mb-1.5 uppercase">USERNAME</label>
                                <input type="text" value={user?.username || ''} readOnly className={`w-full p-2.5 rounded-[10px] border outline-none opacity-70 transition-colors duration-300 ${theme.input} ${theme.border} ${theme.text}`} />
                            </div>
                            <div className="mb-[15px]">
                                <label className="block text-[0.65rem] text-primary font-black mb-1.5 uppercase">EMAIL</label>
                                <input type="email" value={email} readOnly className={`w-full p-2.5 rounded-[10px] border outline-none opacity-70 transition-colors duration-300 ${theme.input} ${theme.border} ${theme.text}`} />
                            </div>
                        </div>
                        
                        <button 
                            onClick={logout} 
                            className="w-full mt-[25px] p-3 rounded-xl border border-primary text-primary bg-transparent font-black transition-colors duration-300 hover:bg-primary hover:text-white"
                        >
                            ВИЙТИ З СИСТЕМИ
                        </button>
                    </aside>

                    {/* --- ГОЛОВНА ПАНЕЛЬ --- */}
                    <main>
                        
                        {/* 1. Блок: Біометрія */}
                        <div className={`p-[30px] rounded-[24px] border shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-colors duration-300 mb-[30px] ${theme.card} ${theme.border}`} data-aos="fade-up">
                            <div className="flex justify-between items-center mb-[20px]">
                                <h4 className="text-primary font-black tracking-[1px] m-0">БІОМЕТРІЯ</h4>
                                <div className="bg-primary text-white px-3 py-1 rounded-lg font-black text-[0.8rem]">BMI: {bmi}</div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[20px] mb-[20px]">
                                <div className={`p-[20px] rounded-[20px] border transition-colors duration-300 ${theme.input} ${theme.border}`}>
                                    <label className="block text-[0.75rem] font-bold text-[#888]">ВАГА (КГ)</label>
                                    <div className="text-[2.5rem] font-black">{weight}</div>
                                    <input type="range" min="40" max="150" value={weight} onChange={(e)=>setWeight(Number(e.target.value))} className="w-full cursor-pointer accent-primary" />
                                </div>
                                <div className={`p-[20px] rounded-[20px] border transition-colors duration-300 ${theme.input} ${theme.border}`}>
                                    <label className="block text-[0.75rem] font-bold text-[#888]">ЦІЛЬ (КГ)</label>
                                    <input type="number" value={goal} onChange={(e)=>setGoal(Number(e.target.value))} className={`w-[100px] text-[2.5rem] font-black bg-transparent border-none outline-none ${theme.text}`} />
                                    <div className="h-[8px] mt-[15px] bg-black/10 rounded-[10px] overflow-hidden">
                                        <div className="h-full bg-primary shadow-[0_0_10px_#ff0000] transition-all duration-500" style={{width: `${progressToGoal}%`}}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <label className="font-bold text-[#888] mr-2.5">ЗРІСТ (CM): </label>
                                <input type="number" value={height} onChange={(e)=>setHeight(Number(e.target.value))} className={`w-[80px] text-center font-black p-2.5 rounded-[10px] border outline-none transition-colors duration-300 focus:border-primary focus:shadow-[0_0_10px_rgba(255,0,0,0.2)] ${theme.input} ${theme.border} ${theme.text}`} />
                            </div>
                        </div>

                        {/* 2. Блок: Мої записи */}
                        <div className={`p-[30px] rounded-[24px] border shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-colors duration-300 mb-[30px] ${theme.card} ${theme.border}`} data-aos="fade-up">
                            <h4 className="text-primary font-black tracking-[1px] mb-[20px]">МОЇ ТРЕНУВАННЯ</h4>
                            <div className="flex flex-col gap-[15px]">
                                {isBookingsLoading ? (
                                    <>
                                        <div className={`h-[70px] rounded-xl animate-pulse ${theme.input}`}></div>
                                        <div className={`h-[70px] rounded-xl animate-pulse ${theme.input}`}></div>
                                    </>
                                ) : bookings.length === 0 ? (
                                    <div className={`p-[20px] rounded-xl border border-dashed text-center opacity-60 ${theme.input} ${theme.border}`}>
                                        Ви ще не записані на жодне тренування. Перейдіть до Розкладу.
                                    </div>
                                ) : (
                                    bookings.map(b => (
                                        <div key={b.id} className={`p-[15px_20px] rounded-xl border-l-[4px] flex justify-between items-center transition-colors duration-300 ${b.status === 'cancelled' ? 'border-l-[#888]' : 'border-l-primary'} ${theme.input}`}>
                                            <div>
                                                <strong className="block text-[1.1rem]">{b.session?.class_name || 'Групове заняття'}</strong>
                                                <span className="text-[0.85rem] text-[#888]">{new Date(b.session?.start_at).toLocaleString('uk-UA', { dateStyle: 'short', timeStyle: 'short' })}</span>
                                            </div>
                                            <div className="flex items-center gap-[15px]">
                                                <div className={`font-black text-[0.8rem] tracking-[1px] ${b.status === 'cancelled' ? 'text-[#888]' : 'text-primary'}`}>
                                                    {getStatusLabel(b.status)}
                                                </div>
                                                
                                                {b.status === 'booked' && (
                                                    <button 
                                                        onClick={() => handleCancelBooking(b.id)}
                                                        disabled={cancelMutation.isPending}
                                                        title="Скасувати запис"
                                                        className="w-[30px] h-[30px] flex items-center justify-center text-[1.2rem] text-[#888] rounded-full hover:bg-black/10 hover:text-primary transition-colors disabled:opacity-50"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* 3. Блок: Активність */}
                        <div className={`p-[30px] rounded-[24px] border shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-colors duration-300 mb-[30px] ${theme.card} ${theme.border}`} data-aos="fade-up">
                            <h4 className="text-primary font-black tracking-[1px] mb-[20px]">ЩОДЕННИК АКТИВНОСТІ</h4>
                            <div className="flex justify-between items-end h-[150px] py-[10px]">
                                {activity.map((h, i) => (
                                    <div key={i} className="w-[12%] text-center">
                                        <div className={`h-[120px] rounded-[10px] relative overflow-hidden ${theme.input}`}>
                                            <div className="absolute bottom-0 left-0 w-full bg-primary shadow-[0_0_8px_#ff0000] transition-all duration-600" style={{height: `${h}%`}}></div>
                                        </div>
                                        <span className="block text-[0.7rem] text-[#888] font-extrabold mt-2.5">{['Пн','Вт','Ср','Чт','Пт','Сб','Нд'][i]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 4. Блок: Календар */}
                        <div className={`p-[30px] rounded-[24px] border shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-colors duration-300 ${theme.card} ${theme.border}`} data-aos="fade-up">
                            <div className="flex justify-between items-center mb-[25px]">
                                <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))} className={`w-[45px] h-[45px] rounded-xl border flex items-center justify-center cursor-pointer transition-colors duration-300 hover:bg-primary hover:text-white hover:border-primary ${theme.input} ${theme.border}`}>←</button>
                                <h4 className="font-bold m-0">{viewDate.toLocaleString('uk-UA', { month: 'long', year: 'numeric' }).toUpperCase()}</h4>
                                <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))} className={`w-[45px] h-[45px] rounded-xl border flex items-center justify-center cursor-pointer transition-colors duration-300 hover:bg-primary hover:text-white hover:border-primary ${theme.input} ${theme.border}`}>→</button>
                            </div>
                            <div className="grid grid-cols-7 gap-2.5">
                                {['Пн','Вт','Ср','Чт','Пт','Сб','Нд'].map(d => <div key={d} className="text-center text-[0.75rem] text-primary font-black pb-2.5">{d}</div>)}
                                {getDaysArray().map((date, i) => {
                                    if (!date) return <div key={`empty-${i}`}></div>;
                                    const key = formatDateKey(date);
                                    const hasNote = userNotes[key];
                                    return (
                                        <div key={key} 
                                            className={`aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer border border-transparent transition-all duration-200 hover:-translate-y-0.5 hover:border-primary ${theme.input} ${hasNote ? 'border-primary bg-primary/5' : ''}`}
                                            onClick={() => { setActiveDayKey(key); setTempNote(userNotes[key] || ''); }}
                                        >
                                            <span className="font-semibold">{date.getDate()}</span>
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
                    <div className={`p-[40px] rounded-[30px] border border-primary w-full max-w-[350px] text-center ${theme.card}`} onClick={e => e.stopPropagation()}>
                        <h5 className="text-primary font-black mb-[20px] text-[1.2rem]">ПЛАН: {activeDayKey.split('-').reverse().join('.')}</h5>
                        <input 
                            type="text" 
                            value={tempNote} 
                            onChange={e => setTempNote(e.target.value)} 
                            onKeyDown={e => e.key === 'Enter' && handleSaveNote()} 
                            placeholder="Назва тренування..." 
                            autoFocus 
                            className={`w-full p-[15px] rounded-xl border mb-[20px] outline-none transition-colors focus:border-primary ${theme.input} ${theme.border} ${theme.text}`}
                        />
                        <button 
                            className="w-full p-[12px_30px] bg-primary text-white rounded-xl font-black cursor-pointer shadow-[0_5px_15px_rgba(255,0,0,0.3)] hover:-translate-y-1 transition-all" 
                            onClick={handleSaveNote}
                        >
                            ЗБЕРЕГТИ ДАНІ
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </section>
    );
}