import { useState, useEffect, useRef } from 'react';
import { authRequest, publicRequest } from '../utils/api';
import { useAuth } from '../context/AuthContext';

// ІМПОРТ RECHARTS
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ukLocale from '@fullcalendar/core/locales/uk';

const dataAttendance = [
  { day: 'Пн', visits: 45 }, { day: 'Вт', visits: 52 }, { day: 'Ср', visits: 48 },
  { day: 'Чт', visits: 70 }, { day: 'Пт', visits: 61 }, { day: 'Сб', visits: 38 }, { day: 'Нд', visits: 20 }
];

const dataClasses = [
  { name: 'Кросфіт', value: 400 }, { name: 'Йога', value: 300 },
  { name: 'Бокс', value: 200 }, { name: 'TRX', value: 278 }
];

const COLORS = ['#e60000', '#ff4d4d', '#990000', '#4d0000'];

export default function AdminPanel() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [trainers, setTrainers] = useState([]);
    const [clients, setClients] = useState([]);

    useEffect(() => {
        document.body.classList.add('admin-body');
        loadData();
        return () => document.body.classList.remove('admin-body');
    }, [activeTab]);

    const loadData = async () => {
        try {
            const [t, c] = await Promise.all([
                authRequest('/api/admin/instructors/'),
                authRequest('/api/admin/members/')
            ]);
            setTrainers(t || []);
            setClients(c || []);
        } catch (e) { console.error(e); }
    };

    return (
        <div className={`admin-wrapper ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <aside className={`admin-sidebar ${sidebarOpen ? 'active' : ''}`}>
                <div className="admin-logo">FIT<span>GYM</span> ADMIN</div>
                <nav className="admin-menu">
                    <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
                        <i className="fas fa-chart-line"></i> Огляд
                    </button>
                    <button className={activeTab === 'schedule' ? 'active' : ''} onClick={() => setActiveTab('schedule')}>
                        <i className="fas fa-calendar-alt"></i> Розклад
                    </button>
                    <button className={activeTab === 'clients' ? 'active' : ''} onClick={() => setActiveTab('clients')}>
                        <i className="fas fa-users"></i> Клієнти
                    </button>
                    <button className={activeTab === 'trainers' ? 'active' : ''} onClick={() => setActiveTab('trainers')}>
                        <i className="fas fa-dumbbell"></i> Тренери
                    </button>
                </nav>
                <div className="admin-footer"><button onClick={logout}>Вихід</button></div>
            </aside>

            <main className="admin-content">
                <header className="admin-topbar">
                    <button className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
                    <h2>ПАНЕЛЬ КЕРУВАННЯ</h2>
                    <div className="admin-user"><span>{user?.username}</span><div className="avatar">A</div></div>
                </header>

                <div className="admin-page-content">
                    {activeTab === 'dashboard' && (
                        <div className="dashboard-layout">
                            <div className="admin-grid">
                                <div className="admin-card highlight-red">
                                    <h3>Клієнти</h3>
                                    <div className="val">{clients.length || 124}</div>
                                    <span className="trend positive">↑ 12%</span>
                                </div>
                                <div className="admin-card">
                                    <h3>Виручка</h3>
                                    <div className="val">₴ 142,500</div>
                                </div>
                                <div className="admin-card">
                                    <h3>Тренери</h3>
                                    <div className="val">{trainers.length || 12}</div>
                                </div>
                            </div>

                            <div className="charts-row">
                                <div className="chart-container">
                                    <h3>Відвідуваність (тиждень)</h3>
                                    <div className="recharts-wrapper">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={dataAttendance}>
                                                <defs>
                                                    <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#e60000" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#e60000" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                                <XAxis dataKey="day" stroke="#888" />
                                                <YAxis stroke="#888" />
                                                <Tooltip contentStyle={{backgroundColor: '#111', border: '1px solid #333', color: '#fff'}} />
                                                <Area type="monotone" dataKey="visits" stroke="#e60000" strokeWidth={3} fillOpacity={1} fill="url(#colorV)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="chart-container">
                                    <h3>Популярні напрямки</h3>
                                    <div className="recharts-wrapper">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={dataClasses} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                                    {dataClasses.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'schedule' && (
                        <div className="admin-calendar-box">
                            <FullCalendar plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} initialView="timeGridWeek" locale={ukLocale} height="80vh" />
                        </div>
                    )}

                    {(activeTab === 'trainers' || activeTab === 'clients') && (
                        <div className="table-wrap">
                            <table className="admin-table">
                                <thead><tr><th>Ім'я</th><th>Контакт</th><th>Дії</th></tr></thead>
                                <tbody>
                                    {(activeTab === 'trainers' ? trainers : clients).map(item => (
                                        <tr key={item.id}><td>{item.full_name || item.name}</td><td>{item.contact || item.email}</td><td><button>✏️</button></td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}