import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar, LineChart, Line
} from 'recharts';

// ДЕМО ДАНІ
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
  { id: 1, text: 'Нова підписка: Олексій В.', time: '10 хв тому', icon: 'fa-user-plus', color: '#2ecc71' },
  { id: 2, text: 'Оплата: Безліміт (1200 ₴)', time: '25 хв тому', icon: 'fa-credit-card', color: '#ff0000' },
  { id: 3, text: 'Скасування броні: Йога', time: '1 год тому', icon: 'fa-calendar-times', color: '#888' },
  { id: 4, text: 'Нова підписка: Марія К.', time: '2 год тому', icon: 'fa-user-plus', color: '#2ecc71' },
  { id: 5, text: 'Оплата: PRO (2500 ₴)', time: '3 год тому', icon: 'fa-credit-card', color: '#ff0000' },
];

const COLORS = ['#ff0000', '#cc0000', '#990000', '#4d0000'];

// Tailwind версія PremiumTooltip
const PremiumTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0f0f0f]/95 backdrop-blur-[10px] border border-[#333] px-4 py-3 rounded-lg text-white shadow-xl">
                <p className="m-0 mb-2 text-[#888] text-[0.8rem] font-bold uppercase">{label}</p>
                <p className="m-0 text-[1.1rem] flex items-center gap-2 font-black">
                    <span className="w-2 h-2 bg-primary rounded-full inline-block shadow-[0_0_8px_#ff0000]"></span>
                    {prefix}{payload[0].value}{suffix}
                </p>
            </div>
        );
    }
    return null;
};

export default function DashboardTab({ clientsCount, trainersCount }) {
    return (
        <div className="flex flex-col gap-[30px] animate-fadeIn">
            
            {/* РЯД 1: СТАТИСТИКА */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[25px]">
                <div className="group relative overflow-hidden bg-gradient-to-br from-[#161616] to-[#0d0d0d] border border-[#222] p-[25px] rounded-2xl flex items-start gap-5 transition-all duration-400 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:border-primary hover:-translate-y-1.5">
                    <div className="bg-primary/10 text-primary w-[50px] h-[50px] rounded-xl flex items-center justify-center text-[1.4rem] shrink-0 relative z-10"><i className="fas fa-users"></i></div>
                    <div className="relative z-10">
                        <h3 className="text-[0.8rem] text-[#888] uppercase m-0 mb-2 font-bold tracking-wide">Активні клієнти</h3>
                        <div className="text-[2rem] font-black text-white leading-none mb-2.5">{clientsCount || 124}</div>
                        <span className="text-[0.8rem] font-bold inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[#ff4d4d] bg-primary/10"><i className="fas fa-arrow-up"></i> 12% за місяць</span>
                    </div>
                    <div className="absolute -top-1/2 -right-1/2 w-[150px] h-[150px] bg-[radial-gradient(circle,rgba(255,0,0,0.1)_0%,transparent_70%)] rounded-full blur-[20px] transition-all duration-500 z-0 group-hover:scale-150 group-hover:bg-[radial-gradient(circle,rgba(255,0,0,0.2)_0%,transparent_70%)]"></div>
                </div>

                <div className="group relative overflow-hidden bg-gradient-to-br from-[#161616] to-[#0d0d0d] border border-[#222] p-[25px] rounded-2xl flex items-start gap-5 transition-all duration-400 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:border-primary hover:-translate-y-1.5">
                    <div className="bg-primary/10 text-primary w-[50px] h-[50px] rounded-xl flex items-center justify-center text-[1.4rem] shrink-0 relative z-10"><i className="fas fa-wallet"></i></div>
                    <div className="relative z-10">
                        <h3 className="text-[0.8rem] text-[#888] uppercase m-0 mb-2 font-bold tracking-wide">Виручка (Місяць)</h3>
                        <div className="text-[2rem] font-black text-white leading-none mb-2.5">₴ 142.5K</div>
                        <span className="text-[0.8rem] font-bold inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[#ff4d4d] bg-primary/10"><i className="fas fa-arrow-up"></i> 8% за місяць</span>
                    </div>
                    <div className="absolute -top-1/2 -right-1/2 w-[150px] h-[150px] bg-[radial-gradient(circle,rgba(255,0,0,0.1)_0%,transparent_70%)] rounded-full blur-[20px] transition-all duration-500 z-0 group-hover:scale-150 group-hover:bg-[radial-gradient(circle,rgba(255,0,0,0.2)_0%,transparent_70%)]"></div>
                </div>

                <div className="group relative overflow-hidden bg-gradient-to-br from-[#161616] to-[#0d0d0d] border border-[#222] p-[25px] rounded-2xl flex items-start gap-5 transition-all duration-400 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:border-white/50 hover:-translate-y-1.5">
                    <div className="bg-white/10 text-white w-[50px] h-[50px] rounded-xl flex items-center justify-center text-[1.4rem] shrink-0 relative z-10"><i className="fas fa-user-plus"></i></div>
                    <div className="relative z-10">
                        <h3 className="text-[0.8rem] text-[#888] uppercase m-0 mb-2 font-bold tracking-wide">Нові підписки</h3>
                        <div className="text-[2rem] font-black text-white leading-none mb-2.5">28</div>
                        <span className="text-[0.8rem] font-bold inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[#ff4d4d] bg-primary/10"><i className="fas fa-arrow-up"></i> 5% за тиждень</span>
                    </div>
                    <div className="absolute -top-1/2 -right-1/2 w-[150px] h-[150px] bg-[radial-gradient(circle,rgba(255,255,255,0.05)_0%,transparent_70%)] rounded-full blur-[20px] transition-all duration-500 z-0 group-hover:scale-150 group-hover:bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_70%)]"></div>
                </div>

                <div className="group relative overflow-hidden bg-gradient-to-br from-[#161616] to-[#0d0d0d] border border-[#222] p-[25px] rounded-2xl flex items-start gap-5 transition-all duration-400 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:border-[#888] hover:-translate-y-1.5">
                    <div className="bg-white/5 text-[#888] w-[50px] h-[50px] rounded-xl flex items-center justify-center text-[1.4rem] shrink-0 relative z-10"><i className="fas fa-dumbbell"></i></div>
                    <div className="relative z-10">
                        <h3 className="text-[0.8rem] text-[#888] uppercase m-0 mb-2 font-bold tracking-wide">Тренери в залі</h3>
                        <div className="text-[2rem] font-black text-white leading-none mb-2.5">{trainersCount || 12}</div>
                        <span className="text-[0.8rem] font-bold inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[#888] bg-white/5">Без змін</span>
                    </div>
                </div>
            </div>

            {/* РЯД 2: ГОЛОВНІ ГРАФІКИ */}
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-[25px]">
                <div className="bg-[#141414]/60 backdrop-blur-[20px] border border-[#222] rounded-2xl p-[25px] shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
                    <div className="flex justify-between items-center mb-[25px]">
                        <h3 className="text-[1rem] text-[#eee] m-0 font-extrabold uppercase tracking-wide">Динаміка відвідуваності</h3>
                        <span className="bg-primary/10 text-[#ff4d4d] text-[0.75rem] font-bold px-2.5 py-1 rounded-md border border-primary/20">Останні 7 днів</span>
                    </div>
                    <div className="w-full h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dataAttendance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ff0000" stopOpacity={0.5}/>
                                        <stop offset="95%" stopColor="#ff0000" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                <XAxis dataKey="day" stroke="#666" tick={{fill: '#888', fontSize: 12}} axisLine={false} tickLine={false} />
                                <YAxis stroke="#666" tick={{fill: '#888', fontSize: 12}} axisLine={false} tickLine={false} />
                                <Tooltip content={<PremiumTooltip suffix=" чол." />} cursor={{ stroke: '#ff0000', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                <Area type="monotone" dataKey="visits" stroke="#ff0000" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" activeDot={{ r: 6, fill: '#ff0000', stroke: '#111', strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-[#141414]/60 backdrop-blur-[20px] border border-[#222] rounded-2xl p-[25px] shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
                    <div className="flex justify-between items-center mb-[25px]">
                        <h3 className="text-[1rem] text-[#eee] m-0 font-extrabold uppercase tracking-wide">Напрямки</h3>
                    </div>
                    <div className="w-full h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={dataClasses} innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value" stroke="none">
                                    {dataClasses.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff'}} itemStyle={{color: '#fff'}} />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#888' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* РЯД 3: ДОДАТКОВА АНАЛІТИКА ТА ДІЇ */}
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.2fr] gap-[25px]">
                <div className="bg-[#141414]/60 backdrop-blur-[20px] border border-[#222] rounded-2xl p-[25px] shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
                    <div className="flex justify-between items-center mb-[25px]">
                        <h3 className="text-[1rem] text-[#eee] m-0 font-extrabold uppercase tracking-wide">Завантаженість за годинами (Сьогодні)</h3>
                    </div>
                    <div className="w-full h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dataPeakHours} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                <XAxis dataKey="hour" stroke="#666" tick={{fill: '#888', fontSize: 12}} axisLine={false} tickLine={false} />
                                <YAxis stroke="#666" tick={{fill: '#888', fontSize: 12}} axisLine={false} tickLine={false} />
                                <Tooltip content={<PremiumTooltip suffix=" чол." />} cursor={{ fill: 'rgba(255,0,0,0.1)' }} />
                                <Bar dataKey="users" fill="#ff0000" radius={[4, 4, 0, 0]} maxBarSize={40}>
                                    {dataPeakHours.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.users > 60 ? '#ff0000' : '#880000'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-[#141414]/60 backdrop-blur-[20px] border border-[#222] rounded-2xl p-[25px] shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
                    <div className="flex justify-between items-center mb-[25px]">
                        <h3 className="text-[1rem] text-[#eee] m-0 font-extrabold uppercase tracking-wide">Останні події</h3>
                    </div>
                    <div className="flex flex-col gap-4 h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                        {recentActivities.map(item => (
                            <div key={item.id} className="flex items-center gap-4 p-3 bg-white/5 border border-white/5 rounded-xl transition-colors duration-200 hover:bg-white/10 cursor-default">
                                <div className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-[1rem] shrink-0" style={{color: item.color, background: `${item.color}20`}}>
                                    <i className={`fas ${item.icon}`}></i>
                                </div>
                                <div>
                                    <p className="m-0 text-[0.85rem] text-[#eee] font-semibold">{item.text}</p>
                                    <span className="text-[0.75rem] text-[#666]">{item.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* РЯД 4: ФІНАНСИ */}
            <div className="grid grid-cols-1 gap-[25px]">
                <div className="bg-[#141414]/60 backdrop-blur-[20px] border border-[#222] rounded-2xl p-[25px] shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
                    <div className="flex justify-between items-center mb-[25px]">
                        <h3 className="text-[1rem] text-[#eee] m-0 font-extrabold uppercase tracking-wide">Динаміка виручки (Півріччя, тис. ₴)</h3>
                        <span className="text-[0.8rem] font-bold inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[#ff4d4d] bg-primary/10"><i className="fas fa-chart-line"></i> +29%</span>
                    </div>
                    <div className="w-full h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dataRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                <XAxis dataKey="month" stroke="#666" tick={{fill: '#888', fontSize: 12}} axisLine={false} tickLine={false} />
                                <YAxis stroke="#666" tick={{fill: '#888', fontSize: 12}} axisLine={false} tickLine={false} />
                                <Tooltip content={<PremiumTooltip prefix="₴ " suffix="K" />} />
                                <Line type="monotone" dataKey="rev" stroke="#ff0000" strokeWidth={4} dot={{ r: 4, fill: '#111', stroke: '#ff0000', strokeWidth: 2 }} activeDot={{ r: 8, fill: '#ff0000', stroke: '#fff', strokeWidth: 2 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
            `}</style>
        </div>
    );
}