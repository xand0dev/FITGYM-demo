import { useState, useEffect } from 'react';

import { authRequest } from '../utils/api';

import { useAuth } from '../context/AuthContext';



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



const COLORS = ['#FF0000', '#CC0000', '#FFFFFF', '#444444'];



export default function AdminPanel() {

    const { user, logout } = useAuth();

    const [activeTab, setActiveTab] = useState('dashboard');

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [trainers, setTrainers] = useState([]);

    const [clients, setClients] = useState([]);



    // ПРИМУСОВИЙ СТИЛЬ: Чорне скло з червоним акцентом

    const glassStyle = {

        background: 'rgba(10, 10, 10, 0.75)',

        backdropFilter: 'blur(35px)',

        WebkitBackdropFilter: 'blur(35px)',

        border: '1px solid rgba(255, 0, 0, 0.25)',

        borderRadius: '30px',

        padding: '25px',

        color: '#fff',

        boxShadow: '0 15px 35px rgba(0,0,0,0.6)'

    };



    useEffect(() => {

        document.body.classList.add('admin-body');

        loadData();

        return () => document.body.classList.remove('admin-body');

    }, [activeTab]);



    const loadData = async () => {

        try {

            const [t, c] = await Promise.all([

                authRequest('/api/admin/instructors/').catch(() => []),

                authRequest('/api/admin/members/').catch(() => [])

            ]);

            setTrainers(t || []);

            setClients(c || []);

        } catch (e) { console.error(e); }

    };



    return (

        <div className={`admin-wrapper ${sidebarOpen ? 'sidebar-open' : ''}`} style={{

            backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070')`,

            backgroundSize: 'cover',

            backgroundPosition: 'center',

            backgroundAttachment: 'fixed',

            minHeight: '100vh',

            display: 'flex',

            color: '#fff'

        }}>

           

            {/* SIDEBAR */}

            <aside className="admin-sidebar" style={{

                width: '260px',

                background: 'rgba(0,0,0,0.8)',

                backdropFilter: 'blur(20px)',

                borderRight: '1px solid rgba(255,0,0,0.2)',

                display: 'flex',

                flexDirection: 'column',

                height: '100vh',

                position: 'fixed',

                zIndex: 1000

            }}>

                <div className="admin-logo" style={{ padding: '40px 20px', fontSize: '1.8rem', fontWeight: '900', textAlign: 'center' }}>

                    FIT<span style={{color: '#FF0000'}}>GYM</span>

                </div>

                <nav className="admin-menu" style={{ flex: 1 }}>

                    {['dashboard', 'schedule', 'clients', 'trainers'].map((tab) => (

                        <button

                            key={tab}

                            onClick={() => setActiveTab(tab)}

                            style={{

                                width: '100%', padding: '18px 30px', background: 'none', border: 'none', textAlign: 'left',

                                color: activeTab === tab ? '#fff' : '#aaa',

                                borderLeft: activeTab === tab ? '5px solid #FF0000' : '5px solid transparent',

                                cursor: 'pointer', fontSize: '1rem', fontWeight: '600', transition: '0.3s',

                                background: activeTab === tab ? 'linear-gradient(90deg, rgba(255,0,0,0.15) 0%, transparent 100%)' : 'none'

                            }}

                        >

                            {tab === 'dashboard' && ' Огляд'}

                            {tab === 'schedule' && ' Розклад'}

                            {tab === 'clients' && ' Клієнти'}

                            {tab === 'trainers' && ' Тренери'}

                        </button>

                    ))}

                </nav>

                <div style={{ padding: '30px' }}>

                    <button onClick={logout} style={{ color: '#fff', background: '#FF0000', border: 'none', padding: '12px 20px', borderRadius: '15px', width: '100%', cursor: 'pointer', fontWeight: '700', boxShadow: '0 5px 15px rgba(255,0,0,0.3)' }}>ВИХІД</button>

                </div>

            </aside>



            {/* MAIN CONTENT */}

            <main className="admin-content" style={{ marginLeft: '260px', flex: 1, padding: '40px' }}>

                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>

                    <h2 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-1px', textTransform: 'uppercase' }}>{activeTab === 'dashboard' ? 'Аналітика' : activeTab}</h2>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>

                        <span style={{ fontWeight: '600' }}>{user?.username}</span>

                        <div style={{ width: '45px', height: '45px', background: '#FF0000', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>A</div>

                    </div>

                </header>



                <div className="admin-page-content fade-in">

                    {activeTab === 'dashboard' && (

                        <div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginBottom: '30px' }}>

                                <div style={glassStyle}>

                                    <h3 style={{ color: '#888', fontSize: '0.85rem', textTransform: 'uppercase' }}>Активні клієнти</h3>

                                    <div style={{ fontSize: '3rem', fontWeight: '900', margin: '10px 0' }}>{clients.length || 124}</div>

                                    <span style={{ color: '#00FF41', fontWeight: '700' }}>↑ 12% за місяць</span>

                                </div>

                                <div style={glassStyle}>

                                    <h3 style={{ color: '#888', fontSize: '0.85rem', textTransform: 'uppercase' }}>Виручка</h3>

                                    <div style={{ fontSize: '3rem', fontWeight: '900', margin: '10px 0' }}>142.5K</div>

                                    <span style={{ color: '#FF0000', fontWeight: '700' }}>₴ ГРИВЕНЬ</span>

                                </div>

                                <div style={glassStyle}>

                                    <h3 style={{ color: '#888', fontSize: '0.85rem', textTransform: 'uppercase' }}>Тренери</h3>

                                    <div style={{ fontSize: '3rem', fontWeight: '900', margin: '10px 0' }}>{trainers.length || 12}</div>

                                </div>

                            </div>



                            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '25px' }}>

                                <div style={glassStyle}>

                                    <h3 style={{ marginBottom: '25px', fontWeight: '800' }}>ВІДВІДУВАНІСТЬ</h3>

                                    <div style={{ width: '100%', height: 350 }}>

                                        <ResponsiveContainer>

                                            <AreaChart data={dataAttendance}>

                                                <defs>

                                                    <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">

                                                        <stop offset="5%" stopColor="#FF0000" stopOpacity={0.4}/>

                                                        <stop offset="95%" stopColor="#FF0000" stopOpacity={0}/>

                                                    </linearGradient>

                                                </defs>

                                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />

                                                <XAxis dataKey="day" stroke="#888" />

                                                <YAxis stroke="#888" />

                                                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #FF0000', borderRadius: '15px' }} />

                                                <Area type="monotone" dataKey="visits" stroke="#FF0000" strokeWidth={4} fill="url(#colorRed)" />

                                            </AreaChart>

                                        </ResponsiveContainer>

                                    </div>

                                </div>



                                <div style={glassStyle}>

                                    <h3 style={{ marginBottom: '25px', fontWeight: '800' }}>ПОПУЛЯРНІ НАПРЯМКИ</h3>

                                    <div style={{ width: '100%', height: 350 }}>

                                        <ResponsiveContainer>

                                            <PieChart>

                                                <Pie data={dataClasses} innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">

                                                    {dataClasses.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="none" />)}

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

                        <div style={glassStyle}>

                            <FullCalendar plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} initialView="timeGridWeek" locale={ukLocale} height="70vh" />

                        </div>

                    )}



                    {(activeTab === 'trainers' || activeTab === 'clients') && (

                        <div style={glassStyle}>

                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>

                                <thead>

                                    <tr style={{ color: '#FF0000', textAlign: 'left', borderBottom: '2px solid #333' }}>

                                        <th style={{ padding: '20px' }}>ІМ'Я</th>

                                        <th style={{ padding: '20px' }}>КОНТАКТИ</th>

                                        <th style={{ padding: '20px' }}>ДІЯ</th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {(activeTab === 'trainers' ? trainers : clients).map(item => (

                                        <tr key={item.id} style={{ borderBottom: '1px solid #222' }}>

                                            <td style={{ padding: '20px', fontWeight: '700' }}>{item.full_name || item.name}</td>

                                            <td style={{ padding: '20px', color: '#888' }}>{item.contact || item.email}</td>

                                            <td style={{ padding: '20px' }}>

                                                <button style={{ background: '#FF0000', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>ЗМІНИТИ</button>

                                            </td>

                                        </tr>

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