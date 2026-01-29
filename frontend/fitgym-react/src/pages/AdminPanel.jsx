import { useState, useEffect, useRef } from 'react';
import { authRequest, publicRequest } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ukLocale from '@fullcalendar/core/locales/uk'; 

export default function AdminPanel() {
    const { user, logout } = useAuth();
    
    const [activeTab, setActiveTab] = useState('dashboard'); 
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    const [trainers, setTrainers] = useState([]);
    const [clients, setClients] = useState([]);
    const [workoutTypes, setWorkoutTypes] = useState([]);
    const [clientSearch, setClientSearch] = useState('');
    
    const [modalType, setModalType] = useState(null); 
    // Ініціалізуємо пустими рядками, щоб React не сварився
    const [formData, setFormData] = useState({
        username: '', password: '', name: '', email: '', phone: '', specialization: '', 
        start: '', end: '', capacity: 20
    });

    const calendarRef = useRef(null);

    useEffect(() => {
        // Динамічно додаємо клас на body для стилів адмінки
        document.body.classList.add('admin-body');
        
        loadWorkoutTypes(); 
        if (activeTab === 'trainers') loadTrainers();
        if (activeTab === 'clients') loadClients();

        // Прибираємо клас при виході зі сторінки
        return () => document.body.classList.remove('admin-body');
    }, [activeTab]);

    const loadTrainers = async () => {
        try {
            const data = await authRequest('/api/admin/instructors/');
            setTrainers(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
    };

    const loadClients = async () => {
        try {
            const data = await authRequest('/api/admin/members/');
            setClients(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
    };

    const loadWorkoutTypes = async () => {
        try {
            const data = await publicRequest('/api/classes/');
            setWorkoutTypes(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
    };

    const fetchEvents = async (info, successCallback, failureCallback) => {
        try {
            const url = `/api/schedule/?start=${info.startStr}&end=${info.endStr}`;
            const data = await publicRequest(url);
            
            const events = data.map(item => ({
                id: item.id,
                title: item.class_name || 'Тренування',
                start: item.start_at,
                end: item.end_at,
                backgroundColor: '#e60000', 
                borderColor: '#e60000',
                extendedProps: {
                    capacity: item.capacity,
                    instructor_name: item.instructor_name 
                }
            }));
            successCallback(events);
        } catch (error) { failureCallback(error); }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let endpoint = '', payload = {}, method = formData.id ? 'PUT' : 'POST';

            if (modalType === 'trainer') {
                endpoint = formData.id ? `/api/admin/instructors/${formData.id}/` : '/api/admin/instructors/';
                const nameParts = (formData.name || '').trim().split(' ');
                payload = {
                    first_name: nameParts[0],
                    last_name: nameParts.slice(1).join(' ') || '',
                    specialties: formData.specialization,
                    contact: formData.phone
                };
                if (!formData.id) { payload.username = formData.username; payload.password = formData.password; }
            }
            else if (modalType === 'client') {
                endpoint = formData.id ? `/api/admin/members/${formData.id}/` : '/api/admin/members/';
                const nameParts = (formData.name || '').trim().split(' ');
                payload = {
                    first_name: nameParts[0],
                    last_name: nameParts.slice(1).join(' ') || '',
                    email: formData.email,
                    contact: formData.phone,
                    status: formData.status || 'active'
                };
                if (!formData.id) { payload.username = formData.username; payload.password = formData.password; }
            }
            else if (modalType === 'event') {
                endpoint = formData.id ? `/api/admin/schedule/${formData.id}/` : '/api/admin/schedule/';
                const formatDateTime = (dateStr) => (!dateStr) ? null : (dateStr.length === 16 ? `${dateStr}:00` : dateStr);
                
                payload = {
                    class_type: parseInt(formData.class_type_id), // ID типу
                    instructor: parseInt(formData.instructor_id), // ID тренера
                    start_at: formatDateTime(formData.start),
                    end_at: formatDateTime(formData.end),
                    capacity: parseInt(formData.capacity)
                };
            }

            await authRequest(endpoint, method, payload);
            
            if (modalType === 'trainer') loadTrainers();
            if (modalType === 'client') loadClients();
            if (modalType === 'event' && calendarRef.current) calendarRef.current.getApi().refetchEvents();

            setModalType(null);
            alert('Збережено!');
        } catch (err) { alert('Помилка: ' + err.message); }
    };

    const handleDelete = async () => {
        if (!confirm('Видалити?')) return;
        try {
            let endpoint = '';
            if (modalType === 'trainer') endpoint = `/api/admin/instructors/${formData.id}/`;
            if (modalType === 'client') endpoint = `/api/admin/members/${formData.id}/`;
            if (modalType === 'event') endpoint = `/api/admin/schedule/${formData.id}/`;

            await authRequest(endpoint, 'DELETE');
            
            if (modalType === 'trainer') loadTrainers();
            if (modalType === 'client') loadClients();
            if (modalType === 'event' && calendarRef.current) calendarRef.current.getApi().refetchEvents();
            
            setModalType(null);
        } catch (err) { alert('Помилка: ' + err.message); }
    };

    const openEventModal = (event = null, startStr = null) => {
        if (trainers.length === 0) loadTrainers();
        if (workoutTypes.length === 0) loadWorkoutTypes();

        if (startStr) {
            const startDate = new Date(startStr);
            const now = new Date();
            startDate.setHours(now.getHours() + 1, 0, 0, 0);
            const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
            const toLocalISO = (d) => { const offset = d.getTimezoneOffset() * 60000; return new Date(d.getTime() - offset).toISOString().slice(0, 16); };

            setFormData({
                class_type_id: workoutTypes.length > 0 ? workoutTypes[0].id : '',
                instructor_id: trainers.length > 0 ? trainers[0].id : '',
                start: toLocalISO(startDate),
                end: toLocalISO(endDate),
                capacity: 20
            });
        } else if (event) {
            const toLocalISO = (d) => { const offset = d.getTimezoneOffset() * 60000; return new Date(d.getTime() - offset).toISOString().slice(0, 16); };
            setFormData({
                id: event.id,
                class_type_id: '', 
                instructor_id: '', 
                start: toLocalISO(event.start),
                end: toLocalISO(event.end),
                capacity: event.extendedProps.capacity || 20
            });
        }
        setModalType('event');
    };

    // Обгортаємо все в клас admin-wrapper
    return (
        <div className={`admin-wrapper ${sidebarOpen ? 'sidebar-open' : ''}`}>
            
            {/* SIDEBAR */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'active' : ''}`}>
                <div className="admin-logo">FIT<span>GYM</span> ADMIN</div>
                <nav className="admin-menu">
                    <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}><i className="fas fa-chart-line"></i> Огляд</button>
                    <button className={activeTab === 'schedule' ? 'active' : ''} onClick={() => setActiveTab('schedule')}><i className="fas fa-calendar-alt"></i> Розклад</button>
                    <button className={activeTab === 'clients' ? 'active' : ''} onClick={() => setActiveTab('clients')}><i className="fas fa-users"></i> Клієнти</button>
                    <button className={activeTab === 'trainers' ? 'active' : ''} onClick={() => setActiveTab('trainers')}><i className="fas fa-dumbbell"></i> Тренери</button>
                </nav>
                <div className="admin-footer">
                    <button onClick={logout}><i className="fas fa-sign-out-alt"></i> Вихід</button>
                </div>
            </aside>

            {/* MAIN */}
            <main className="admin-content">
                <header className="admin-topbar">
                    <button className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
                    <h2>Панель керування</h2>
                    <div className="admin-user">
                        <span>{user?.username}</span> 
                        <div className="avatar">A</div>
                    </div>
                </header>

                <div className="admin-page-content">
                    {activeTab === 'dashboard' && (
                        <div className="admin-grid">
                            <div className="admin-card"><h3>Клієнтів</h3><div className="val">{clients.length}</div></div>
                            <div className="admin-card"><h3>Тренерів</h3><div className="val">{trainers.length}</div></div>
                            <div className="admin-card"><h3>Типів занять</h3><div className="val">{workoutTypes.length}</div></div>
                        </div>
                    )}

                    {activeTab === 'schedule' && (
                        <div className="admin-section">
                            <div style={{textAlign:'right', marginBottom:15}}>
                                <button className="admin-btn" onClick={() => openEventModal(null, new Date().toISOString())}>+ Додати заняття</button>
                            </div>
                            <div className="admin-calendar-box">
                                <FullCalendar
                                    ref={calendarRef}
                                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                    initialView="timeGridWeek"
                                    locale={ukLocale}
                                    slotMinTime="08:00:00" slotMaxTime="22:00:00" allDaySlot={false} height="auto"
                                    headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' }}
                                    events={fetchEvents}
                                    dateClick={(info) => openEventModal(null, info.dateStr)}
                                    eventClick={(info) => openEventModal(info.event)}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'clients' && (
                        <div className="admin-section">
                            <div className="admin-controls">
                                <input placeholder="Пошук..." value={clientSearch} onChange={e => setClientSearch(e.target.value)} />
                                <button className="admin-btn" onClick={() => { setFormData({}); setModalType('client'); }}>+ Додати</button>
                            </div>
                            <div className="table-wrap">
                                <table className="admin-table">
                                    <thead><tr><th>Ім'я</th><th>Email</th><th>Телефон</th><th>Статус</th><th>Дії</th></tr></thead>
                                    <tbody>
                                        {clients.filter(c => (c.full_name||'').toLowerCase().includes(clientSearch.toLowerCase())).map(c => (
                                            <tr key={c.id}>
                                                <td>{c.full_name}</td><td>{c.email}</td><td>{c.contact}</td>
                                                <td><span className={`badge ${c.status}`}>{c.status}</span></td>
                                                <td>
                                                    <button onClick={() => { setFormData({ id: c.id, name: c.full_name, email: c.email, phone: c.contact, status: c.status }); setModalType('client'); }}>✏️</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    
                     {activeTab === 'trainers' && (
                        <div className="admin-section">
                            <div className="admin-controls">
                                <h3>Тренери</h3>
                                <button className="admin-btn" onClick={() => { setFormData({}); setModalType('trainer'); }}>+ Додати</button>
                            </div>
                            <table className="admin-table">
                                <thead><tr><th>Ім'я</th><th>Спец.</th><th>Телефон</th><th>Дії</th></tr></thead>
                                <tbody>
                                    {trainers.map(t => (
                                        <tr key={t.id}>
                                            <td>{t.full_name}</td><td>{t.specialties}</td><td>{t.contact}</td>
                                            <td>
                                                <button onClick={() => { setFormData({ id: t.id, name: t.full_name, specialization: t.specialties, phone: t.contact }); setModalType('trainer'); }}>✏️</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* ADMIN MODAL */}
            {modalType && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <button className="close-btn" onClick={() => setModalType(null)}>×</button>
                        <h2>{formData.id ? 'Редагувати' : 'Створити'}</h2>
                        <form onSubmit={handleSubmit}>
                            {(modalType === 'client' || modalType === 'trainer') && (
                                <>
                                    {!formData.id && (
                                        <div className="row">
                                            <input placeholder="Username" name="username" value={formData.username} onChange={handleInputChange} required />
                                            <input placeholder="Password" type="password" name="password" value={formData.password} onChange={handleInputChange} required />
                                        </div>
                                    )}
                                    <input placeholder="ПІБ" name="name" value={formData.name} onChange={handleInputChange} required />
                                    {modalType === 'client' && <input placeholder="Email" name="email" value={formData.email} onChange={handleInputChange} required />}
                                    <div className="row">
                                        <input placeholder="Телефон" name="phone" value={formData.phone} onChange={handleInputChange} />
                                        {modalType === 'client' && (
                                            <select name="status" value={formData.status} onChange={handleInputChange}>
                                                <option value="active">Active</option><option value="inactive">Inactive</option>
                                            </select>
                                        )}
                                        {modalType === 'trainer' && <input placeholder="Спеціалізація" name="specialization" value={formData.specialization} onChange={handleInputChange} required />}
                                    </div>
                                </>
                            )}
                            
                            {modalType === 'event' && (
                                <>
                                    <label>Тип заняття</label>
                                    <select name="class_type_id" value={formData.class_type_id} onChange={handleInputChange} required>
                                        <option value="">Оберіть...</option>
                                        {workoutTypes.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                    </select>
                                    
                                    <label>Тренер</label>
                                    <select name="instructor_id" value={formData.instructor_id} onChange={handleInputChange} required>
                                        <option value="">Оберіть...</option>
                                        {trainers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                                    </select>

                                    <div className="row">
                                        <div><label>Початок</label><input type="datetime-local" name="start" value={formData.start} onChange={handleInputChange} required /></div>
                                        <div><label>Кінець</label><input type="datetime-local" name="end" value={formData.end} onChange={handleInputChange} required /></div>
                                    </div>
                                    <label>Кількість місць</label>
                                    <input type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} />
                                </>
                            )}

                            <div className="actions">
                                {formData.id && <button type="button" className="del-btn" onClick={handleDelete}>Видалити</button>}
                                <button type="submit" className="save-btn">Зберегти</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}