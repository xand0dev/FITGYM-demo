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
    const [trainers, setTrainers] = useState([]);
    const [clients, setClients] = useState([]);
    
    // Стан модального вікна
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ 
        id: null, name: '', contact: '', spec: 'Універсал', 
        exp: '', schedule: '', status: 'Активний', bio: '' 
    });

    const glassStyle = {
        background: 'rgba(15, 15, 15, 0.75)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: '1px solid rgba(255, 0, 0, 0.2)',
        borderRadius: '30px',
        padding: '30px',
        color: '#fff',
    };

    const globalStyles = `
      body, html { background-color: #000; margin: 0; padding: 0; }
      .admin-wrapper { min-height: 100vh; background-color: #000; }
      .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); display: flex; justify-content: center; align-items: center; z-index: 9999; }
      .modal-card { background: #111; border: 2px solid #FF0000; padding: 35px; border-radius: 25px; width: 550px; max-height: 90vh; overflow-y: auto; box-shadow: 0 0 30px rgba(255,0,0,0.2); }
      .input-group { margin-bottom: 15px; }
      .input-group label { display: block; font-size: 0.75rem; color: #888; text-transform: uppercase; margin-bottom: 5px; font-weight: 800; }
      .input-field { width: 100%; background: #1a1a1a; border: 1px solid #333; padding: 12px; color: white; border-radius: 12px; outline: none; transition: 0.3s; }
      .input-field:focus { border-color: #FF0000; }
      .badge { padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 900; text-transform: uppercase; }
    `;

    useEffect(() => { loadData(); }, [activeTab]);

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

    const openModal = (item = null) => {
        if (item) {
            setFormData({ 
                id: item.id, 
                name: item.full_name || item.name, 
                contact: item.contact || '', 
                spec: item.spec || 'Кросфіт',
                exp: item.exp || '3 роки',
                schedule: item.schedule || 'Пн-Пт 10:00-20:00',
                status: item.status || 'Активний',
                bio: item.bio || ''
            });
            setEditMode(true);
        } else {
            setFormData({ id: null, name: '', contact: '', spec: 'Кросфіт', exp: '', schedule: '', status: 'Активний', bio: '' });
            setEditMode(false);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = () => {
        const payload = { ...formData, full_name: formData.name };
        if (activeTab === 'trainers') {
            if (editMode) {
                setTrainers(trainers.map(t => t.id === formData.id ? payload : t));
            } else {
                setTrainers([...trainers, { ...payload, id: Date.now() }]);
            }
        }
        setIsModalOpen(false);
    };

    return (
        <div className="admin-wrapper" style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070')`,
            backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed',
            display: 'flex', color: '#fff', fontFamily: "'Inter', sans-serif"
        }}>
            <style>{globalStyles}</style>

            {/* ВСПЛИВАЮЧЕ ВІКНО ДЛЯ ТРЕНЕРІВ */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <h2 style={{ color: '#FF0000', fontWeight: '900', textTransform: 'uppercase', marginBottom: '25px', letterSpacing: '-1px' }}>
                            {editMode ? 'Редагувати профіль' : 'Новий тренер'}
                        </h2>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="input-group">
                                <label>ПІБ Тренера</label>
                                <input className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Олексій Степанов" />
                            </div>
                            <div className="input-group">
                                <label>Телефон</label>
                                <input className="input-field" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} placeholder="+380..." />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '10px' }}>
                            <div className="input-group">
                                <label>Напрямок</label>
                                <select className="input-field" value={formData.spec} onChange={e => setFormData({...formData, spec: e.target.value})}>
                                    <option>Кросфіт</option>
                                    <option>Бокс</option>
                                    <option>Йога</option>
                                    <option>Тренажерний зал</option>
                                    <option>TRX</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Досвід роботи</label>
                                <input className="input-field" value={formData.exp} onChange={e => setFormData({...formData, exp: e.target.value})} placeholder="напр. 5 років" />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Графік роботи</label>
                            <input className="input-field" value={formData.schedule} onChange={e => setFormData({...formData, schedule: e.target.value})} placeholder="Пн, Ср, Пт: 09:00 - 18:00" />
                        </div>

                        <div className="input-group">
                            <label>Статус</label>
                            <select className="input-field" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                <option>Активний</option>
                                <option>У відпустці</option>
                                <option>Звільнений</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label>Про тренера / Коротка біографія</label>
                            <textarea className="input-field" rows="3" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Досягнення, сертифікати..."></textarea>
                        </div>

                        <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                            <button onClick={handleSubmit} style={{ flex: 2, background: '#FF0000', color: '#fff', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase' }}>Зберегти дані</button>
                            <button onClick={() => setIsModalOpen(false)} style={{ flex: 1, background: '#222', color: '#fff', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer' }}>Відміна</button>
                        </div>
                    </div>
                </div>
            )}

            {/* SIDEBAR */}
            <aside style={{ width: '260px', background: 'rgba(0,0,0,0.95)', borderRight: '1px solid rgba(255,0,0,0.2)', position: 'fixed', height: '100vh', zIndex: 1000 }}>
                <div style={{ padding: '40px 20px', fontSize: '2rem', fontWeight: '900', textAlign: 'center' }}>FIT<span style={{color: '#FF0000'}}>GYM</span></div>
                <nav>
                    {['dashboard', 'schedule', 'clients', 'trainers'].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} style={{
                            width: '100%', padding: '20px 30px', background: 'none', border: 'none', textAlign: 'left',
                            color: activeTab === tab ? '#fff' : '#444', fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase',
                            borderLeft: activeTab === tab ? '6px solid #FF0000' : '6px solid transparent',
                            background: activeTab === tab ? 'linear-gradient(90deg, rgba(255, 0, 0, 0.1) 0%, transparent 100%)' : 'none'
                        }}>
                            {tab === 'dashboard' ? 'Огляд' : tab === 'schedule' ? 'Розклад' : tab === 'clients' ? 'Клієнти' : 'Тренери'}
                        </button>
                    ))}
                </nav>
            </aside>

            <main style={{ marginLeft: '260px', flex: 1, padding: '40px' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '900', textTransform: 'uppercase' }}>{activeTab}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.05)', padding: '10px 20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{textAlign: 'right'}}><div style={{fontWeight: '800'}}>{user?.username || 'admin'}</div><div style={{color: '#FF0000', fontSize: '0.7rem', fontWeight: '700'}}>ONLINE</div></div>
                        <div style={{ width: '40px', height: '40px', background: 'linear-gradient(45deg, #FF0000, #990000)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>A</div>
                    </div>
                </header>

                {activeTab === 'dashboard' && (
                    <div className="fade-in">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginBottom: '30px' }}>
                            <div style={glassStyle}><h3 style={{ color: '#666', fontSize: '0.8rem' }}>Клієнти</h3><div style={{ fontSize: '3.5rem', fontWeight: '900' }}>{clients.length || 124}</div><span style={{color: '#00FF41', fontWeight: '700'}}>↑ 12% за місяць</span></div>
                            <div style={glassStyle}><h3 style={{ color: '#666', fontSize: '0.8rem' }}>Виручка</h3><div style={{ fontSize: '3.5rem', fontWeight: '900' }}>142.5K</div><span style={{color: '#FF0000', fontWeight: '700'}}>₴ ГРИВЕНЬ</span></div>
                            <div style={glassStyle}><h3 style={{ color: '#666', fontSize: '0.8rem' }}>Тренери</h3><div style={{ fontSize: '3.5rem', fontWeight: '900' }}>{trainers.length || 12}</div><span style={{opacity: 0.6}}>Всі на зміні</span></div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '25px' }}>
                            <div style={glassStyle}><h3 style={{ marginBottom: '25px', fontWeight: '900' }}>ВІДВІДУВАНІСТЬ</h3>
                                <div style={{height: 350}}><ResponsiveContainer><AreaChart data={dataAttendance}><defs><linearGradient id="cR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FF0000" stopOpacity={0.6}/><stop offset="95%" stopColor="#FF0000" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false}/><XAxis dataKey="day" stroke="#555"/><YAxis stroke="#555"/><Tooltip contentStyle={{background:'#000', border:'1px solid #FF0000'}}/><Area type="monotone" dataKey="visits" stroke="#FF0000" strokeWidth={4} fill="url(#cR)"/></AreaChart></ResponsiveContainer></div>
                            </div>
                            <div style={glassStyle}><h3 style={{ marginBottom: '25px', fontWeight: '900' }}>НАПРЯМКИ</h3>
                                <div style={{height: 350}}><ResponsiveContainer><PieChart><Pie data={dataClasses} innerRadius={80} outerRadius={100} paddingAngle={8} dataKey="value">{dataClasses.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}</Pie><Tooltip/><Legend/></PieChart></ResponsiveContainer></div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'schedule' && (
                    <div style={glassStyle} className="fade-in">
                        <FullCalendar plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} initialView="timeGridWeek" locale={ukLocale} height="70vh" selectable={true} />
                    </div>
                )}

                {(activeTab === 'clients' || activeTab === 'trainers') && (
                    <div style={glassStyle} className="fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                            <h3 style={{ fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>База даних {activeTab}</h3>
                            <button onClick={() => openModal()} style={{ background: '#FF0000', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 5px 15px rgba(255,0,0,0.3)' }}>+ ДОДАТИ</button>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ color: '#FF0000', textAlign: 'left', borderBottom: '2px solid #333' }}>
                                    <th style={{ padding: '20px', fontSize: '0.8rem' }}>ІМ'Я ТА ПРІЗВИЩЕ</th>
                                    <th style={{ padding: '20px', fontSize: '0.8rem' }}>КОНТАКТИ</th>
                                    <th style={{ padding: '20px', fontSize: '0.8rem' }}>{activeTab === 'trainers' ? 'НАПРЯМОК' : 'СТАТУС'}</th>
                                    <th style={{ padding: '20px', fontSize: '0.8rem', textAlign: 'right' }}>ДІЯ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(activeTab === 'trainers' ? trainers : clients).map(item => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: '0.2s' }}>
                                        <td style={{ padding: '20px', fontWeight: '700' }}>{item.full_name || item.name}</td>
                                        <td style={{ padding: '20px', color: '#888' }}>{item.contact || item.email || '—'}</td>
                                        <td style={{ padding: '20px' }}>
                                            <span className="badge" style={{ 
                                                background: (item.status === 'Активний' ? 'rgba(0,255,65,0.1)' : 'rgba(255,0,0,0.1)'),
                                                color: (item.status === 'Активний' ? '#00FF41' : '#FF0000'),
                                                border: `1px solid ${item.status === 'Активний' ? 'rgba(0,255,65,0.2)' : 'rgba(255,0,0,0.2)'}`
                                            }}>
                                                {activeTab === 'trainers' ? (item.spec || 'Fitness') : (item.status || 'Активний')}
                                            </span>
                                        </td>
                                        <td style={{ padding: '20px', textAlign: 'right' }}>
                                            <button onClick={() => openModal(item)} style={{ background: '#FF0000', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}>ЗМІНИТИ</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}