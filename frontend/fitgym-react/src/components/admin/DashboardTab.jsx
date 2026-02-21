import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar, LineChart, Line
} from 'recharts';

// ДЕМО ДАНІ (Винесені з AdminPanel)
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

const PremiumTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
    if (active && payload && payload.length) {
        return (
            <div className="premium-tooltip">
                <p className="tooltip-label">{label}</p>
                <p className="tooltip-value">
                    <span className="dot"></span>
                    {prefix}{payload[0].value}{suffix}
                </p>
            </div>
        );
    }
    return null;
};

export default function DashboardTab({ clientsCount, trainersCount }) {
    return (
        <div className="dashboard-layout fade-in">
            {/* РЯД 1: СТАТИСТИКА */}
            <div className="admin-grid">
                <div className="admin-card">
                    <div className="card-icon"><i className="fas fa-users"></i></div>
                    <div className="card-data">
                        <h3>Активні клієнти</h3>
                        <div className="val">{clientsCount || 124}</div>
                        <span className="trend positive"><i className="fas fa-arrow-up"></i> 12% за місяць</span>
                    </div>
                    <div className="card-glow"></div>
                </div>
                <div className="admin-card">
                    <div className="card-icon"><i className="fas fa-wallet"></i></div>
                    <div className="card-data">
                        <h3>Виручка (Місяць)</h3>
                        <div className="val">₴ 142.5K</div>
                        <span className="trend positive"><i className="fas fa-arrow-up"></i> 8% за місяць</span>
                    </div>
                    <div className="card-glow"></div>
                </div>
                <div className="admin-card">
                    <div className="card-icon" style={{color: '#fff'}}><i className="fas fa-user-plus"></i></div>
                    <div className="card-data">
                        <h3>Нові підписки (Тиждень)</h3>
                        <div className="val">28</div>
                        <span className="trend positive"><i className="fas fa-arrow-up"></i> 5% за тиждень</span>
                    </div>
                    <div className="card-glow" style={{background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 70%)'}}></div>
                </div>
                <div className="admin-card">
                    <div className="card-icon"><i className="fas fa-dumbbell"></i></div>
                    <div className="card-data">
                        <h3>Тренери в залі</h3>
                        <div className="val">{trainersCount || 12}</div>
                        <span className="trend neutral">Без змін</span>
                    </div>
                    <div className="card-glow"></div>
                </div>
            </div>

            {/* РЯД 2: ГОЛОВНІ ГРАФІКИ */}
            <div className="charts-row">
                <div className="chart-container">
                    <div className="chart-header">
                        <h3>Динаміка відвідуваності</h3>
                        <span className="badge-red">Останні 7 днів</span>
                    </div>
                    <div className="recharts-wrapper">
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

                <div className="chart-container">
                    <div className="chart-header">
                        <h3>Напрямки</h3>
                    </div>
                    <div className="recharts-wrapper">
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
            <div className="charts-row three-cols">
                <div className="chart-container span-2">
                    <div className="chart-header">
                        <h3>Завантаженість за годинами (Сьогодні)</h3>
                    </div>
                    <div className="recharts-wrapper" style={{height: '250px'}}>
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

                <div className="chart-container">
                    <div className="chart-header">
                        <h3>Останні події</h3>
                    </div>
                    <div className="activity-list">
                        {recentActivities.map(item => (
                            <div key={item.id} className="activity-item">
                                <div className="activity-icon" style={{color: item.color, background: `${item.color}20`}}>
                                    <i className={`fas ${item.icon}`}></i>
                                </div>
                                <div className="activity-info">
                                    <p className="activity-text">{item.text}</p>
                                    <span className="activity-time">{item.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* РЯД 4: ФІНАНСИ */}
            <div className="charts-row">
                <div className="chart-container" style={{gridColumn: '1 / -1'}}>
                    <div className="chart-header">
                        <h3>Динаміка виручки (Півріччя, тис. ₴)</h3>
                        <span className="trend positive" style={{margin: 0}}><i className="fas fa-chart-line"></i> +29%</span>
                    </div>
                    <div className="recharts-wrapper" style={{height: '250px'}}>
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
        </div>
    );
}