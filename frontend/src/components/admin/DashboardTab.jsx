import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
    BarChart, Bar, LineChart, Line
} from 'recharts';
import {
    Users,
    Wallet,
    UserPlus,
    Dumbbell,
    TrendingUp,
    CreditCard,
    CalendarX2,
    Activity
} from "lucide-react";
import GlassCard from '../ui/GlassCard';

// MOCK DATA
const dataAttendance = [
    { day: 'Пн', visits: 45 }, { day: 'Вт', visits: 52 }, { day: 'Ср', visits: 48 },
    { day: 'Чт', visits: 85 }, { day: 'Пт', visits: 61 }, { day: 'Сб', visits: 38 }, { day: 'Нд', visits: 20 }
];

const dataClasses = [
    { name: 'Кросфіт', value: 400 }, { name: 'Йога', value: 300 },
    { name: 'Бокс', value: 200 }, { name: 'TRX', value: 278 }
];

const dataPeakHours = [
    { hour: '08:00', users: 15 }, { hour: '10:00', users: 30 }, { hour: '12:00', users: 20 },
    { hour: '14:00', users: 25 }, { hour: '16:00', users: 40 }, { hour: '18:00', users: 85 },
    { hour: '20:00', users: 60 }, { hour: '22:00', users: 15 }
];

const dataRevenue = [
    { month: 'Січ', rev: 110 }, { month: 'Лют', rev: 115 }, { month: 'Бер', rev: 125 },
    { month: 'Кві', rev: 120 }, { month: 'Тра', rev: 135 }, { month: 'Чер', rev: 142 }
];

const recentActivities = [
    { id: 1, text: 'Нова підписка: Олексій В.', time: '10 хв тому', icon: UserPlus, color: '#2ecc71' },
    { id: 2, text: 'Оплата: Безліміт (1200 ₴)', time: '25 хв тому', icon: CreditCard, color: '#cc0000' },
    { id: 3, text: 'Скасування броні: Йога', time: '1 год тому', icon: CalendarX2, color: '#aaaaaa' },
    { id: 4, text: 'Нова підписка: Марія К.', time: '2 год тому', icon: UserPlus, color: '#2ecc71' },
    { id: 5, text: 'Оплата: PRO (2500 ₴)', time: '3 год тому', icon: CreditCard, color: '#cc0000' },
];

const COLORS = ['#cc0000', '#ff3333', '#990000', '#4d0000'];

// Tailwind версія PremiumTooltip
const PremiumTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0f0f0f]/95 backdrop-blur-md border border-[#333] px-4 py-3 rounded-lg text-[#ffffff] shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                <p className="m-0 mb-2 text-[#aaaaaa] text-xs font-black uppercase tracking-wider">{label}</p>
                <p className="m-0 text-lg flex items-center gap-2 font-black">
                    <span className="w-2 h-2 bg-primary rounded-full inline-block shadow-[0_0_8px_#cc0000]"></span>
                    {prefix}{payload[0].value}{suffix}
                </p>
            </div>
        );
    }
    return null;
};

export default function DashboardTab({ clientsCount, trainersCount }) {
    return (
        <div className="flex flex-col gap-8 animate-fade-in">

            {/* HEADER */}
            <div className="flex justify-between items-center bg-gradient-to-r from-[#141414] to-transparent p-6 rounded-2xl border-l-4 border-primary">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-wider text-[#ffffff] m-0">Панель Управління</h2>
                    <p className="text-[#aaaaaa] text-sm mt-1 font-semibold">Огляд ключових показників фітнес-клубу</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-primary bg-primary/10 px-4 py-2 rounded-lg font-black uppercase tracking-wider text-sm border border-primary/20">
                    <Activity className="w-4 h-4" /> Live
                </div>
            </div>

            {/* ROW 1: METRICS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                <GlassCard className="group relative p-6 transition-all duration-400 hover:border-primary/50 hover:-translate-y-1.5 flex items-start gap-5">
                    <div className="bg-primary/10 text-primary w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(204,0,0,0.2)]">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xs text-[#aaaaaa] uppercase m-0 mb-2 font-black tracking-wider">Активні клієнти</h3>
                        <div className="text-3xl font-black text-[#ffffff] leading-none mb-2.5 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">{clientsCount || 124}</div>
                        <span className="text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-green-500 bg-green-500/10 border border-green-500/20"><TrendingUp className="w-3 h-3" /> +12% за місяць</span>
                    </div>
                </GlassCard>

                <GlassCard className="group relative p-6 transition-all duration-400 hover:border-primary/50 hover:-translate-y-1.5 flex items-start gap-5">
                    <div className="bg-primary/10 text-primary w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(204,0,0,0.2)]">
                        <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xs text-[#aaaaaa] uppercase m-0 mb-2 font-black tracking-wider">Виручка (Місяць)</h3>
                        <div className="text-3xl font-black text-[#ffffff] leading-none mb-2.5 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">142.5K</div>
                        <span className="text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-green-500 bg-green-500/10 border border-green-500/20"><TrendingUp className="w-3 h-3" /> +8% за місяць</span>
                    </div>
                </GlassCard>

                <GlassCard className="group relative p-6 transition-all duration-400 hover:border-[#666] hover:-translate-y-1.5 flex items-start gap-5">
                    <div className="bg-white/5 text-[#ffffff] border border-[#333] w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                        <UserPlus className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xs text-[#aaaaaa] uppercase m-0 mb-2 font-black tracking-wider">Нові підписки</h3>
                        <div className="text-3xl font-black text-[#ffffff] leading-none mb-2.5 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">28</div>
                        <span className="text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-green-500 bg-green-500/10 border border-green-500/20"><TrendingUp className="w-3 h-3" /> +5% за тиждень</span>
                    </div>
                </GlassCard>

                <GlassCard className="group relative p-6 transition-all duration-400 hover:border-[#666] hover:-translate-y-1.5 flex items-start gap-5">
                    <div className="bg-white/5 text-[#aaaaaa] border border-[#333] w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                        <Dumbbell className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xs text-[#aaaaaa] uppercase m-0 mb-2 font-black tracking-wider">Тренери в залі</h3>
                        <div className="text-3xl font-black text-[#ffffff] leading-none mb-2.5 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">{trainersCount || 12}</div>
                        <span className="text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[#aaaaaa] bg-white/5 border border-white/10">Без змін</span>
                    </div>
                </GlassCard>
            </div>

            {/* ROW 2: MAIN CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
                <GlassCard className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm text-[#ffffff] m-0 font-black uppercase tracking-wider">Динаміка відвідуваності</h3>
                        <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] uppercase font-black px-3 py-1.5 rounded-md tracking-wider">Останні 7 днів</span>
                    </div>
                    <div className="w-full h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dataAttendance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#cc0000" stopOpacity={0.6} />
                                        <stop offset="95%" stopColor="#cc0000" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                <XAxis dataKey="day" stroke="#444" tick={{ fill: '#aaaaaa', fontSize: 12, fontWeight: '900' }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#444" tick={{ fill: '#aaaaaa', fontSize: 12, fontWeight: '900' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<PremiumTooltip suffix=" чол." />} cursor={{ stroke: '#cc0000', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                <Area type="monotone" dataKey="visits" stroke="#cc0000" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" activeDot={{ r: 6, fill: '#cc0000', stroke: '#141414', strokeWidth: 3 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm text-[#ffffff] m-0 font-black uppercase tracking-wider">Напрямки</h3>
                    </div>
                    <div className="w-full h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={dataClasses} innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value" stroke="none">
                                    {dataClasses.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<PremiumTooltip suffix=" чол." />} />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#aaaaaa', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>
            </div>

            {/* ROW 3: ADDITIONAL ANALYTICS */}
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.2fr] gap-6">
                <GlassCard className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm text-[#ffffff] m-0 font-black uppercase tracking-wider">Завантаженість за годинами (Сьогодні)</h3>
                    </div>
                    <div className="w-full h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dataPeakHours} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                <XAxis dataKey="hour" stroke="#444" tick={{ fill: '#aaaaaa', fontSize: 12, fontWeight: '900' }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#444" tick={{ fill: '#aaaaaa', fontSize: 12, fontWeight: '900' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<PremiumTooltip suffix=" чол." />} cursor={{ fill: 'rgba(204,0,0,0.1)' }} />
                                <Bar dataKey="users" fill="#cc0000" radius={[4, 4, 0, 0]} maxBarSize={40}>
                                    {dataPeakHours.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.users > 60 ? '#cc0000' : '#660000'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm text-[#ffffff] m-0 font-black uppercase tracking-wider">Останні події</h3>
                    </div>
                    <div className="flex flex-col gap-4 h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                        {recentActivities.map(item => (
                            <div key={item.id} className="flex items-center gap-4 p-4 bg-[#1a1a1a] border border-[#333] rounded-xl transition-colors duration-200 hover:border-[#555] cursor-default">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-inner" style={{ color: item.color, background: `${item.color}15` }}>
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="m-0 text-[13px] tracking-wide text-[#ffffff] font-extrabold truncate">{item.text}</p>
                                    <span className="text-[11px] uppercase tracking-wider text-[#aaaaaa] font-bold mt-0.5 block">{item.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>

            {/* ROW 4: FINANCE */}
            <div className="grid grid-cols-1 gap-6">
                <GlassCard className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm text-[#ffffff] m-0 font-black uppercase tracking-wider">Динаміка виручки (Півріччя, тис. ₴)</h3>
                        <span className="text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-primary bg-primary/10 border border-primary/20"><TrendingUp className="w-3 h-3" /> +29%</span>
                    </div>
                    <div className="w-full h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dataRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                <XAxis dataKey="month" stroke="#444" tick={{ fill: '#aaaaaa', fontSize: 12, fontWeight: '900' }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#444" tick={{ fill: '#aaaaaa', fontSize: 12, fontWeight: '900' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<PremiumTooltip prefix="₴ " suffix="K" />} />
                                <Line type="monotone" dataKey="rev" stroke="#cc0000" strokeWidth={4} dot={{ r: 5, fill: '#141414', stroke: '#cc0000', strokeWidth: 3 }} activeDot={{ r: 8, fill: '#cc0000', stroke: '#ffffff', strokeWidth: 3 }} shadow="0 4px 10px rgba(204,0,0,0.5)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            `}</style>
        </div>
    );
}