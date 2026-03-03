import React from 'react';
import {
    Clock, CalendarDays, MapPin, User, TrendingUp, Dumbbell, Target, ArrowRight, Flame, Zap, Heart
} from "lucide-react";

export default function CabinetOverview({
    user,
    activity,
    viewDate,
    setViewDate,
    getDaysArray,
    userNotes,
    formatDateKey,
    setActiveDayKey,
    setTempNote,
    weight,
    bmi,
    progressToGoal
}) {
    const upcomingClasses = [
        {
            name: "CrossFit Extreme",
            instructor: "Олена Петрова",
            time: "09:00",
            date: "Пн, 15 Січ",
            room: "Зал A",
        },
        {
            name: "Yoga Flow",
            instructor: "Марія Іванова",
            time: "11:30",
            date: "Вт, 16 Січ",
            room: "Зал B",
        },
        {
            name: "HIIT Cardio",
            instructor: "Дмитро Шевченко",
            time: "18:00",
            date: "Ср, 17 Січ",
            room: "Зал C",
        },
    ];

    const firstName = user?.first_name || user?.username || 'Користувач';
    const hasMembership = !!user?.active_membership;
    const membershipName = hasMembership ? user.active_membership.name : 'Немає';
    const membershipEnd = hasMembership ? user.active_membership.end_date : '-';

    return (
        <div className="space-y-6 animate-fade-in text-[var(--c-text)]">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-black uppercase tracking-wider mb-1">
                    Вітаємо, <span className="text-primary">{firstName}</span>
                </h2>
                <p className="text-[#888] text-sm mt-1 font-bold">
                    Ось ваш огляд активностей та статусу
                </p>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { icon: Flame, label: "Тренувань цього місяця", value: "12", color: "text-primary" },
                    { icon: Zap, label: "Калорій спалено", value: "8,420", color: "text-orange-500" },
                    { icon: Heart, label: "Середній пульс", value: "72 bpm", color: "text-green-500" },
                ].map((stat) => (
                    <div key={stat.label} className="p-4 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-transform duration-300 hover:-translate-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            <span className="text-xs text-[#888] uppercase tracking-wider font-extrabold">
                                {stat.label}
                            </span>
                        </div>
                        <p className="text-2xl font-black">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Блок з існуючого Cabinet.jsx: Активність */}
                <div className="p-[20px] sm:p-[30px] rounded-xl border border-[var(--c-border)] shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-colors duration-300 bg-[var(--c-card)] col-span-1 lg:col-span-2">
                    <h4 className="text-primary font-black tracking-[1px] mb-[20px] flex items-center gap-2">
                        <Flame className="w-5 h-5 text-primary" />
                        ЩОДЕННИК АКТИВНОСТІ
                    </h4>
                    <div className="flex justify-between items-end h-[150px] py-[10px]">
                        {activity.map((h, i) => (
                            <div key={i} className="w-[12%] text-center">
                                <div className="h-[120px] rounded-[10px] relative overflow-hidden bg-[var(--c-input)]">
                                    <div className="absolute bottom-0 left-0 w-full bg-primary shadow-[0_0_8px_#ff0000] transition-all duration-[600ms]" style={{ height: `${h}%` }}></div>
                                </div>
                                <span className="block text-[0.7rem] text-[#888] font-extrabold mt-2.5">{['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'][i]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Блок з існуючого Cabinet.jsx: Календар */}
                <div className="p-[20px] sm:p-[30px] rounded-xl border border-[var(--c-border)] shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-colors duration-300 bg-[var(--c-card)] col-span-1 lg:col-span-2">
                    <div className="flex justify-between items-center mb-[25px]">
                        <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))} className="w-[45px] h-[45px] rounded-xl border border-[var(--c-border)] bg-[var(--c-input)] flex items-center justify-center cursor-pointer transition-colors hover:bg-primary hover:text-white hover:border-primary">←</button>
                        <h4 className="font-bold m-0 flex items-center gap-2 uppercase">
                            <CalendarDays className="w-5 h-5 text-primary" />
                            {viewDate.toLocaleString('uk-UA', { month: 'long', year: 'numeric' })}
                        </h4>
                        <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))} className="w-[45px] h-[45px] rounded-xl border border-[var(--c-border)] bg-[var(--c-input)] flex items-center justify-center cursor-pointer transition-colors hover:bg-primary hover:text-white hover:border-primary">→</button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 md:gap-2.5">
                        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].map(d => <div key={d} className="text-center text-[0.75rem] text-primary font-black pb-2.5">{d}</div>)}
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

                {/* Upcoming Classes */}
                <div className="p-6 rounded-xl border border-[var(--c-border)] shadow-[0_4px_20px_rgba(0,0,0,0.1)] bg-[var(--c-card)] col-span-1">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-black uppercase tracking-wider flex items-center gap-2">
                            <CalendarDays className="w-5 h-5 text-primary" />
                            Найближчі заняття
                        </h3>
                        <button className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary/80 transition-colors">
                            <span>Записатися</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {upcomingClasses.map((cls, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-4 p-3 rounded-lg bg-[var(--c-input)] hover:bg-[var(--c-border)] transition-all duration-200 group border border-[var(--c-border)]"
                            >
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                    <Dumbbell className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold truncate">{cls.name}</p>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <span className="text-xs text-[#888] flex items-center gap-1 font-bold">
                                            <User className="w-3 h-3" /> {cls.instructor}
                                        </span>
                                        <span className="text-xs text-[#888] flex items-center gap-1 font-bold">
                                            <MapPin className="w-3 h-3" /> {cls.room}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-sm font-black text-primary">{cls.time}</p>
                                    <p className="text-xs text-[#888] uppercase font-bold">{cls.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Active Subscription */}
                <div className="p-6 rounded-xl border border-[var(--c-border)] shadow-[0_4px_20px_rgba(0,0,0,0.1)] bg-[var(--c-card)] col-span-1 flex flex-col">
                    <h3 className="text-lg font-black uppercase tracking-wider flex items-center gap-2 mb-5">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Активний абонемент
                    </h3>

                    <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--c-input)] border border-[var(--c-border)]">
                            <span className="text-xs text-[#888] uppercase tracking-wider font-bold">План</span>
                            <span className="text-sm font-black text-primary">{membershipName}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--c-input)] border border-[var(--c-border)]">
                            <span className="text-xs text-[#888] uppercase tracking-wider font-bold">Статус</span>
                            {hasMembership ? (
                                <span className="text-xs font-black text-green-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    Активний
                                </span>
                            ) : (
                                <span className="text-xs font-black text-[#888] uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-[#888]" />
                                    Неактивний
                                </span>
                            )}
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--c-input)] border border-[var(--c-border)]">
                            <span className="text-xs text-[#888] uppercase tracking-wider font-bold">Закінчення</span>
                            <span className="text-sm font-bold">{membershipEnd}</span>
                        </div>

                        {/* Days remaining bar (mock data) */}
                        {hasMembership && (
                            <div className="pt-2">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-[#888] font-bold">Стан абонемента</span>
                                    <span className="text-xs font-black text-primary">Активний</span>
                                </div>
                                <div className="h-2 rounded-full bg-[var(--c-input)] overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-primary"
                                        style={{ width: "100%" }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Biometrics Summary */}
                <div className="p-6 rounded-xl border border-[var(--c-border)] shadow-[0_4px_20px_rgba(0,0,0,0.1)] bg-[var(--c-card)] col-span-1 lg:col-span-2">
                    <h3 className="text-lg font-black uppercase tracking-wider flex items-center gap-2 mb-5">
                        <Target className="w-5 h-5 text-primary" />
                        Біометрія — Швидкий огляд
                    </h3>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Поточна вага", value: `${weight} кг`, trend: "Поточна", positive: true },
                            { label: "BMI", value: bmi, trend: "Поточний", positive: true },
                            { label: "Відсоток жиру", value: "18.3%", trend: "Орієнтовний", positive: true },
                            { label: "Прогрес до цілі", value: `${progressToGoal}%`, trend: "На шляху", positive: true },
                        ].map((metric) => (
                            <div key={metric.label} className="p-4 rounded-lg bg-[var(--c-input)] border border-[var(--c-border)] text-center transition-transform hover:-translate-y-1 duration-300">
                                <p className="text-[0.65rem] text-[#888] font-black uppercase tracking-wider mb-2">
                                    {metric.label}
                                </p>
                                <p className="text-2xl font-black">{metric.value}</p>
                                <p className={`text-xs mt-1 font-extrabold uppercase ${metric.positive ? "text-green-500" : "text-red-500"}`}>
                                    {metric.trend}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
