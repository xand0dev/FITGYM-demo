import React, { useMemo } from 'react';
import { CalendarDays, MapPin, User, TrendingUp, Dumbbell, Target, ArrowRight, Flame, Zap, Heart, Clock } from "lucide-react";

// Parse DD.MM.YYYY or YYYY-MM-DD safely
const parseDate = (str) => {
    if (!str || str === '-') return null;
    if (str.includes('.')) {
        const [d, m, y] = str.split('.');
        return new Date(Number(y), Number(m) - 1, Number(d));
    }
    return new Date(str);
};

const RingProgress = ({ percent = 0, daysLeft = 0 }) => {
    const r = 40;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - Math.min(1, Math.max(0, percent / 100)));
    return (
        <svg viewBox="0 0 100 100" className="w-28 h-28">
            <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
            <circle
                cx="50" cy="50" r={r}
                fill="none" stroke="#ff0000" strokeWidth="7" strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={offset}
                transform="rotate(-90 50 50)"
                style={{ filter: 'drop-shadow(0 0 6px rgba(255,0,0,0.7))', transition: 'stroke-dashoffset 1s ease' }}
            />
            <text x="50" y="46" textAnchor="middle" fill="white" fontSize="20"
                fontFamily="'Bebas Neue', sans-serif" letterSpacing="1">{daysLeft}</text>
            <text x="50" y="60" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8"
                fontFamily="Inter, sans-serif" letterSpacing="2">ДНІВ</text>
        </svg>
    );
};

const ActivityBar = ({ value, label, maxValue }) => {
    const pct = maxValue > 0 ? Math.round((value / maxValue) * 100) : 0;
    return (
        <div className="flex flex-col items-center gap-2 flex-1">
            <div className="relative w-full h-[100px] flex items-end">
                <div className="absolute inset-0 rounded-btn bg-white/[0.03]" />
                <div
                    className="relative w-full rounded-btn bg-primary transition-all duration-700"
                    style={{
                        height: `${Math.max(6, pct)}%`,
                        boxShadow: pct > 60 ? '0 0 12px rgba(255,0,0,0.4)' : 'none',
                        opacity: 0.7 + (pct / 300)
                    }}
                />
            </div>
            <span className="font-heading text-[0.6rem] text-white/30 uppercase tracking-wider">{label}</span>
        </div>
    );
};

export default function CabinetOverview({
    user, activity, viewDate, setViewDate,
    getDaysArray, userNotes, formatDateKey,
    setActiveDayKey, setTempNote,
    weight, bmi, progressToGoal
}) {
    const upcomingClasses = [
        { name: "CrossFit Extreme", instructor: "Олена Петрова",  time: "09:00", date: "Пн, 15 Січ", room: "Зал A" },
        { name: "Yoga Flow",        instructor: "Марія Іванова",   time: "11:30", date: "Вт, 16 Січ", room: "Зал B" },
        { name: "HIIT Cardio",      instructor: "Дмитро Шевченко", time: "18:00", date: "Ср, 17 Січ", room: "Зал C" },
    ];

    const firstName = user?.first_name || user?.username || 'Атлет';
    const hasMembership = !!user?.active_membership;
    const membershipName = hasMembership ? user.active_membership.name : null;
    const membershipEndRaw = hasMembership ? user.active_membership.end_date : null;

    const { daysLeft, subPercent } = useMemo(() => {
        const endDate = parseDate(membershipEndRaw);
        if (!endDate || isNaN(endDate.getTime())) return { daysLeft: 0, subPercent: 0 };
        const diff = endDate - new Date();
        const days = Math.max(0, Math.ceil(diff / 86400000));
        return { daysLeft: days, subPercent: Math.min(100, Math.round((days / 30) * 100)) };
    }, [membershipEndRaw]);

    const maxActivity = Math.max(...activity, 1);
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

    return (
        <div className="space-y-5 text-white">

            {/* Welcome Banner */}
            <div className="rounded-card border border-white/[0.06] border-l-2 border-l-primary p-5 sm:p-6 relative overflow-hidden"
                 style={{ background: 'linear-gradient(135deg, rgba(255,0,0,0.06) 0%, rgba(255,255,255,0.01) 50%, transparent 100%)' }}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <p className="font-body text-white/30 text-xs uppercase tracking-[3px] mb-1">Особистий кабінет</p>
                        <h2 className="font-heading text-2xl font-semibold uppercase tracking-wide text-white">
                            Привіт, <span className="text-primary">{firstName}</span> 👋
                        </h2>
                        <p className="font-body text-white/40 text-sm mt-1">Сьогодні чудовий день для тренування</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 font-body text-xs text-white/30">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date().toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </div>
                        <a href="/#schedule" className="hidden sm:flex items-center gap-1 font-heading text-[0.65rem] uppercase tracking-[2px] text-primary/70 hover:text-primary transition-colors">
                            Розклад <ArrowRight className="w-3 h-3" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { icon: Flame,  label: "Тренувань цього місяця", value: "12",    unit: "",    accent: "#ff4444", bg: "rgba(255,68,68,0.08)",  trend: "+3 vs минулий" },
                    { icon: Zap,    label: "Калорій спалено",         value: "8 420", unit: "ккал", accent: "#ff9500", bg: "rgba(255,149,0,0.08)", trend: "цього місяця" },
                    { icon: Heart,  label: "Середній пульс",          value: "72",    unit: "bpm", accent: "#30d158", bg: "rgba(48,209,88,0.08)",  trend: "норма" },
                ].map((s) => (
                    <div key={s.label}
                        className="relative overflow-hidden rounded-card border border-white/[0.06] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/10"
                        style={{ background: `linear-gradient(135deg, ${s.bg} 0%, rgba(255,255,255,0.01) 100%)` }}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-9 h-9 rounded-btn flex items-center justify-center"
                                style={{ background: s.bg }}>
                                <s.icon className="w-4 h-4" style={{ color: s.accent }} />
                            </div>
                            <span className="font-body text-[0.65rem] text-white/25 uppercase tracking-wider">{s.trend}</span>
                        </div>
                        <div className="font-display text-[2.6rem] leading-none text-white mb-1">{s.value}</div>
                        <div className="flex items-baseline gap-1">
                            {s.unit && <span className="font-body text-white/40 text-sm">{s.unit}</span>}
                            <span className="font-body text-white/25 text-xs">{s.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Activity + Subscription */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Activity Chart — 2/3 wide */}
                <div className="lg:col-span-2 rounded-card border border-white/[0.06] bg-white/[0.02] p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h4 className="font-heading text-xs uppercase tracking-[3px] text-white/60 flex items-center gap-2">
                            <Flame className="w-3.5 h-3.5 text-primary" />
                            Активність тижня
                        </h4>
                        <span className="font-body text-[0.65rem] text-white/25 uppercase tracking-wider">
                            {activity.reduce((a, b) => a + b, 0)} хв загалом
                        </span>
                    </div>
                    <div className="flex items-end gap-2">
                        {activity.map((h, i) => (
                            <ActivityBar key={i} value={h} label={days[i]} maxValue={maxActivity} />
                        ))}
                    </div>
                </div>

                {/* Subscription — 1/3 */}
                <div className="rounded-card border p-6 flex flex-col items-center text-center gap-3 relative overflow-hidden"
                    style={{
                        borderColor: hasMembership ? 'rgba(255,0,0,0.25)' : 'rgba(255,255,255,0.06)',
                        background: hasMembership
                            ? 'linear-gradient(160deg, rgba(255,0,0,0.07) 0%, rgba(255,255,255,0.01) 100%)'
                            : 'rgba(255,255,255,0.02)'
                    }}>
                    <h4 className="font-heading text-xs uppercase tracking-[3px] text-white/50 w-full text-left flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5 text-primary" />
                        Абонемент
                    </h4>

                    {hasMembership ? (
                        <>
                            <RingProgress percent={subPercent} daysLeft={daysLeft} />
                            <div>
                                <div className="font-heading text-sm text-white uppercase tracking-wider">{membershipName}</div>
                                <div className="font-body text-white/30 text-xs mt-1">до {membershipEndRaw}</div>
                            </div>
                            <div className="w-full flex items-center justify-between p-2.5 rounded-btn bg-white/[0.04] border border-white/[0.06] mt-auto">
                                <span className="font-body text-xs text-white/30">Статус</span>
                                <span className="flex items-center gap-1.5 font-heading text-xs text-green-400 uppercase tracking-wider">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                    Активний
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-4">
                            <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-white/20" />
                            </div>
                            <p className="font-body text-sm text-white/30">Абонемент не активний</p>
                            <a href="#plans" className="btn-primary py-2 px-5 rounded-btn font-heading text-xs uppercase tracking-[2px] text-white">
                                Придбати план
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* Calendar + Upcoming */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Calendar */}
                <div className="rounded-card border border-white/[0.06] bg-white/[0.02] p-6">
                    <div className="flex justify-between items-center mb-5">
                        <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))}
                            className="w-8 h-8 rounded-btn flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all text-sm">
                            ←
                        </button>
                        <h4 className="font-heading text-xs uppercase tracking-[3px] text-white/60 flex items-center gap-2">
                            <CalendarDays className="w-3.5 h-3.5 text-primary" />
                            {viewDate.toLocaleString('uk-UA', { month: 'long', year: 'numeric' })}
                        </h4>
                        <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))}
                            className="w-8 h-8 rounded-btn flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all text-sm">
                            →
                        </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {['Пн','Вт','Ср','Чт','Пт','Сб','Нд'].map(d => (
                            <div key={d} className="text-center font-heading text-[0.6rem] text-primary/70 uppercase pb-2">{d}</div>
                        ))}
                        {getDaysArray().map((date, i) => {
                            if (!date) return <div key={`e-${i}`} />;
                            const key = formatDateKey(date);
                            const hasNote = userNotes[key];
                            const isToday = key === formatDateKey(new Date());
                            return (
                                <div key={key}
                                    className={`aspect-square rounded-btn flex flex-col items-center justify-center cursor-pointer transition-all duration-200 text-sm font-body
                                        ${isToday ? 'bg-primary/20 border border-primary/40 text-white' :
                                          hasNote ? 'bg-white/[0.06] border border-white/10 text-white' :
                                          'text-white/40 hover:bg-white/[0.04] hover:text-white border border-transparent'}`}
                                    onClick={() => { setActiveDayKey(key); setTempNote(userNotes[key] || ''); }}>
                                    <span className="font-semibold leading-none">{date.getDate()}</span>
                                    {hasNote && <span className="w-1 h-1 bg-primary rounded-full mt-0.5" style={{ boxShadow: '0 0 4px #ff0000' }} />}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Upcoming classes */}
                <div className="rounded-card border border-white/[0.06] bg-white/[0.02] p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-heading text-xs uppercase tracking-[3px] text-white/60 flex items-center gap-2">
                            <CalendarDays className="w-3.5 h-3.5 text-primary" />
                            Найближчі заняття
                        </h3>
                        <button className="flex items-center gap-1 font-heading text-[0.6rem] uppercase tracking-[2px] text-primary/70 hover:text-primary transition-colors">
                            Всі <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="space-y-2 flex-1">
                        {upcomingClasses.map((cls, i) => (
                            <div key={i}
                                className="flex items-center gap-3 p-3.5 rounded-btn border border-transparent hover:border-white/[0.07] hover:bg-white/[0.03] transition-all duration-200 group">
                                <div className="w-10 h-10 rounded-btn flex items-center justify-center bg-primary/10 group-hover:bg-primary/15 transition-colors shrink-0">
                                    <Dumbbell className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-heading text-sm text-white truncate">{cls.name}</p>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <span className="font-body text-[0.65rem] text-white/25 flex items-center gap-1">
                                            <User className="w-2.5 h-2.5" />{cls.instructor}
                                        </span>
                                        <span className="font-body text-[0.65rem] text-white/25 flex items-center gap-1">
                                            <MapPin className="w-2.5 h-2.5" />{cls.room}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="font-display text-xl text-primary leading-none">{cls.time}</p>
                                    <p className="font-body text-[0.6rem] text-white/25 mt-0.5">{cls.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Biometrics */}
            <div className="rounded-card border border-white/[0.06] bg-white/[0.02] p-6">
                <h3 className="font-heading text-xs uppercase tracking-[3px] text-white/60 flex items-center gap-2 mb-5">
                    <Target className="w-3.5 h-3.5 text-primary" />
                    Біометрія
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Вага",           value: weight,        unit: "кг",  trend: "Поточна",    accent: "#ff9500" },
                        { label: "BMI",             value: bmi,           unit: "",    trend: "Норма",       accent: "#30d158" },
                        { label: "Жирова маса",     value: "18.3",        unit: "%",   trend: "Орієнтовно",  accent: "#ff9500" },
                        { label: "До цілі",         value: progressToGoal,unit: "%",   trend: "На шляху",    accent: "#30d158" },
                    ].map((m) => (
                        <div key={m.label}
                            className="p-4 rounded-btn border border-white/[0.05] bg-white/[0.02] hover:border-white/10 transition-all duration-200 hover:-translate-y-0.5 text-center">
                            <p className="font-heading text-[0.6rem] text-white/25 uppercase tracking-widest mb-3">{m.label}</p>
                            <div className="flex items-end justify-center gap-1 mb-2">
                                <span className="font-display text-[2.2rem] text-white leading-none">{m.value}</span>
                                {m.unit && <span className="font-body text-white/40 text-sm mb-1">{m.unit}</span>}
                            </div>
                            <span className="font-body text-[0.6rem] uppercase tracking-widest" style={{ color: m.accent }}>
                                {m.trend}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
