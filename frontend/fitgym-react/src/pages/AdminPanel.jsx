import { useState, useEffect, useRef } from 'react';
import { authRequest, publicRequest } from '../utils/api'; // publicRequest для списку занять
import { useAuth } from '../context/AuthContext';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ukLocale from '@fullcalendar/core/locales/uk';

export default function AdminPanel() {
    const { user, logout } = useAuth();
    
    // --- STATE: UI ---
    const [activeTab, setActiveTab] = useState('dashboard'); 
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // --- STATE: DATA ---
    const [stats, setStats] = useState({ clients: 0, bookings: 0, income: 0 });
    const [trainers, setTrainers] = useState([]);
    const [clients, setClients] = useState([]);
    const [workoutTypes, setWorkoutTypes] = useState([]); // <--- НОВЕ: Список типів занять
    const [clientSearch, setClientSearch] = useState('');
    
    // --- STATE: MODALS ---
    const [modalType, setModalType] = useState(null); 
    const [formData, setFormData] = useState({}); 

    const calendarRef = useRef(null);

    // --- EFFECT: DATA LOADING ---
    useEffect(() => {
        // Завантажуємо базові списки, які потрібні часто
        loadWorkoutTypes(); 
        
        if (activeTab === 'trainers') loadTrainers();
        if (activeTab === 'clients') loadClients();
    }, [activeTab]);

    // --- API CALLS ---
    const loadTrainers = async () => {
        try {
            const data = await authRequest('/api/admin/instructors/');
            setTrainers(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
    };

    const loadClients = async () => {
        try {
            // ВИПРАВЛЕНО: Було 'clients', стало 'members' згідно з urls.py
            const data = await authRequest('/api/admin/members/');
            setClients(Array.isArray(data) ? data : []);
        } catch (e) { console.error("Clients Error:", e); }
    };

    const loadWorkoutTypes = async () => {
        try {
            // Завантажуємо типи тренувань (Yoga, Boxing...) для випадаючого списку
            const data = await publicRequest('/api/classes/');
            setWorkoutTypes(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
    };

    // Calendar Fetch
    const fetchEvents = async (info, successCallback, failureCallback) => {
        try {
            const url = `/api/schedule/?start=${info.startStr}&end=${info.endStr}`;
            const data = await publicRequest(url); // Можна publicRequest, бо читання дозволено всім
            
            const events = data.map(item => ({
                id: item.id,
                title: item.class_name || 'Тренування',
                start: item.start_at,
                end: item.end_at,
                backgroundColor: 'var(--accent)',
                borderColor: 'var(--accent)',
                extendedProps: {
                    // Зберігаємо ID для редагування. 
                    // УВАГА: Бекенд у GET запиті віддає об'єкти? 
                    // Якщо бекенд у GET /schedule/ повертає class_name (рядок), а не ID, 
                    // то при редагуванні нам треба буде співставити назву з ID. 
                    // Але поки припустимо, що ми просто створюємо нові.
                    capacity: item.capacity,
                    instructor_name: item.instructor_name 
                }
            }));
            successCallback(events);
        } catch (error) {
            failureCallback(error);
        }
    };

    // --- HANDLERS ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const closeModal = () => {
        setModalType(null);
        setFormData({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let endpoint = '';
            let payload = {};
            let method = formData.id ? 'PUT' : 'POST';

            // 1. TRAINERS
            if (modalType === 'trainer') {
                endpoint = formData.id ? `/api/admin/instructors/${formData.id}/` : '/api/admin/instructors/';
                const nameParts = (formData.name || '').trim().split(' ');
                payload = {
                    first_name: nameParts[0],
                    last_name: nameParts.slice(1).join(' ') || '',
                    specialties: formData.specialization,
                    contact: formData.phone
                };
                if (!formData.id) {
                    payload.username = formData.username;
                    payload.password = formData.password;
                }
            }
            
            // 2. CLIENTS (MEMBERS)
            else if (modalType === 'client') {
                // ВИПРАВЛЕНО URL
                endpoint = formData.id ? `/api/admin/members/${formData.id}/` : '/api/admin/members/';
                const nameParts = (formData.name || '').trim().split(' ');
                payload = {
                    first_name: nameParts[0],
                    last_name: nameParts.slice(1).join(' ') || '',
                    email: formData.email,
                    contact: formData.phone, // У MemberSerializer поле 'contact', а не 'phone'
                    status: formData.status || 'active'
                };
                // Для створення треба username/password
                if (!formData.id) {
                    payload.username = formData.username;
                    payload.password = formData.password;
                }
            }

            // 3. SCHEDULE (EVENTS)
            else if (modalType === 'event') {
                endpoint = formData.id ? `/api/admin/schedule/${formData.id}/` : '/api/admin/schedule/';
                
                // Форматуємо дату: додаємо секунди, якщо треба
                const formatDateTime = (dateStr) => {
                    if (!dateStr) return null;
                    return dateStr.length === 16 ? `${dateStr}:00` : dateStr;
                };

                payload = {
                    // ВИПРАВЛЕНО: Відправляємо class_type (ID), а не class_name
                    class_type: parseInt(formData.class_type_id), 
                    instructor: parseInt(formData.instructor_id),
                    start_at: formatDateTime(formData.start),
                    end_at: formatDateTime(formData.end),
                    capacity: parseInt(formData.capacity)
                };
            }

            await authRequest(endpoint, method, payload);
            
            // Refresh
            if (modalType === 'trainer') loadTrainers();
            if (modalType === 'client') loadClients();
            if (modalType === 'event' && calendarRef.current) calendarRef.current.getApi().refetchEvents();

            closeModal();
            alert('Успішно збережено!');

        } catch (err) {
            console.error(err);
            alert('Помилка: ' + err.message);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Видалити?')) return;
        try {
            let endpoint = '';
            if (modalType === 'trainer') endpoint = `/api/admin/instructors/${formData.id}/`;
            if (modalType === 'client') endpoint = `/api/admin/members/${formData.id}/`; // Виправлено URL
            if (modalType === 'event') endpoint = `/api/admin/schedule/${formData.id}/`;

            await authRequest(endpoint, 'DELETE');

            if (modalType === 'trainer') loadTrainers();
            if (modalType === 'client') loadClients();
            if (modalType === 'event' && calendarRef.current) calendarRef.current.getApi().refetchEvents();

            closeModal();
        } catch (err) {
            alert('Помилка видалення: ' + err.message);
        }
    };

    // --- OPEN MODALS ---
    const openTrainerModal = (trainer = null) => {
        setFormData(trainer ? {
            id: trainer.id,
            name: trainer.full_name || trainer.name,
            specialization: trainer.specialties || trainer.specialization,
            phone: trainer.contact || trainer.phone
        } : { name: '', specialization: '', phone: '', username: '', password: '' });
        setModalType('trainer');
    };

    const openClientModal = (client = null) => {
        setFormData(client ? {
            id: client.id,
            name: client.full_name,
            email: client.email || client.user_email, // MemberSerializer може мати user_email
            phone: client.contact,
            status: client.status || 'active'
        } : { name: '', email: '', phone: '', status: 'active', username: '', password: '' });
        setModalType('client');
    };

    const openEventModal = (event = null, startStr = null) => {
        // Якщо списки пусті - спробувати завантажити
        if (trainers.length === 0) loadTrainers();
        if (workoutTypes.length === 0) loadWorkoutTypes();

        if (startStr) {
            // NEW EVENT
            const startDate = new Date(startStr);
            const now = new Date();
            startDate.setHours(now.getHours() + 1, 0, 0, 0); // Початок наступної години
            const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 година
            
            const toLocalISO = (d) => {
                const offset = d.getTimezoneOffset() * 60000;
                return new Date(d.getTime() - offset).toISOString().slice(0, 16);
            };

            setFormData({
                class_type_id: workoutTypes.length > 0 ? workoutTypes[0].id : '', // Дефолтний тип
                instructor_id: trainers.length > 0 ? trainers[0].id : '',
                start: toLocalISO(startDate),
                end: toLocalISO(endDate),
                capacity: 20
            });
        } else if (event) {
            // EDIT EVENT
            // Примітка: Редагування складніше, бо нам треба знати ID типу заняття,
            // а fullCalendar може мати тільки назву. 
            // Поки що залишимо можливість ТІЛЬКИ ВИДАЛЯТИ існуючі, або редагувати час.
            // Щоб повноцінно редагувати, бекенд /schedule/ має повертати class_type ID.
            
            const toLocalISO = (d) => {
                 const offset = d.getTimezoneOffset() * 60000;
                 return new Date(d.getTime() - offset).toISOString().slice(0, 16);
            };

            setFormData({
                id: event.id,
                // Тут ми не знаємо справжній ID типу, якщо його немає в extendedProps.
                // Спробуємо знайти за назвою або просто залишимо пустим (користувач вибере заново)
                class_type_id: '', 
                instructor_id: '', // Те саме
                start: toLocalISO(event.start),
                end: toLocalISO(event.end),
                capacity: event.extendedProps.capacity || 20
            });
        }
        setModalType('event');
    };

    return (
        <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
            {/* SIDEBAR */}
            <aside className={`dashboard-sidebar ${sidebarOpen ? 'active' : ''}`}>
                <div className="sidebar-logo">FIT<span>GYM</span> ADMIN</div>
                <nav className="sidebar-menu">
                    <button className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><i className="fas fa-chart-line"></i> Огляд</button>
                    <button className={`menu-item ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}><i className="fas fa-calendar-alt"></i> Розклад</button>
                    <button className={`menu-item ${activeTab === 'clients' ? 'active' : ''}`} onClick={() => setActiveTab('clients')}><i className="fas fa-users"></i> Клієнти</button>
                    <button className={`menu-item ${activeTab === 'trainers' ? 'active' : ''}`} onClick={() => setActiveTab('trainers')}><i className="fas fa-dumbbell"></i> Тренери</button>
                </nav>
                <div className="sidebar-footer">
                    <button className="menu-item logout-link" onClick={logout} style={{background:'none', border:'none', width:'100%', cursor:'pointer', textAlign:'left'}}>
                        <i className="fas fa-sign-out-alt"></i> Вихід
                    </button>
                </div>
            </aside>

            {/* MAIN */}
            <main className="dashboard-main">
                <header className="dashboard-topbar">
                    <button className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}><i className="fas fa-bars"></i></button>
                    <h2>Панель керування</h2>
                    <div className="admin-profile"><span>{user?.username}</span> <div className="avatar-circle"><i className="fas fa-user"></i></div></div>
                </header>

                {/* --- TABS --- */}
                {activeTab === 'dashboard' && (
                    <section className="content-section active">
                        <div className="stats-grid">
                            <div className="stat-card"><h3>Клієнтів</h3><div className="value">{clients.length || 0}</div></div>
                            <div className="stat-card"><h3>Тренерів</h3><div className="value">{trainers.length || 0}</div></div>
                            <div className="stat-card"><h3>Типів занять</h3><div className="value">{workoutTypes.length || 0}</div></div>
                        </div>
                    </section>
                )}

                {activeTab === 'schedule' && (
                    <section className="content-section active">
                        <div className="schedule-controls">
                            <button className="btn btn-primary" onClick={() => openEventModal(null, new Date().toISOString())}>+ Додати</button>
                        </div>
                        <div id="calendar">
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
                    </section>
                )}

                {activeTab === 'clients' && (
                    <section className="content-section active">
                        <div className="card">
                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}>
                                <h3>Клієнти</h3>
                                <div style={{display:'flex', gap:'10'}}>
                                    <input placeholder="Пошук..." value={clientSearch} onChange={e => setClientSearch(e.target.value)} style={{padding:'8px', background:'#333', border:'1px solid #555', color:'#fff'}} />
                                    <button className="btn btn-primary" onClick={() => openClientModal(null)}>+ Додати</button>
                                </div>
                            </div>
                            <div className="table-responsive">
                                <table className="data-table">
                                    <thead><tr><th>Ім'я</th><th>Email</th><th>Телефон</th><th>Статус</th><th>Дії</th></tr></thead>
                                    <tbody>
                                        {clients.filter(c => (c.full_name || '').toLowerCase().includes(clientSearch.toLowerCase())).map(c => (
                                            <tr key={c.id} onClick={() => openClientModal(c)}>
                                                <td>{c.full_name}</td>
                                                <td>{c.email}</td>
                                                <td>{c.contact || c.phone}</td>
                                                <td>{c.status}</td>
                                                <td><button className="action-btn"><i className="fas fa-edit"></i></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                )}

                {activeTab === 'trainers' && (
                    <section className="content-section active">
                        <div className="card">
                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}>
                                <h3>Тренери</h3>
                                <button className="btn btn-primary" onClick={() => openTrainerModal(null)}>+ Додати</button>
                            </div>
                            <table className="data-table">
                                <thead><tr><th>Ім'я</th><th>Спец.</th><th>Телефон</th><th>Дії</th></tr></thead>
                                <tbody>
                                    {trainers.map(t => (
                                        <tr key={t.id} onClick={() => openTrainerModal(t)}>
                                            <td>{t.full_name}</td><td>{t.specialties}</td><td>{t.contact}</td>
                                            <td><button className="action-btn"><i className="fas fa-edit"></i></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </main>

            {/* --- MODAL --- */}
            {modalType && (
                <div className="modal-overlay active" style={{opacity:1, pointerEvents:'auto'}}>
                    <div className="modal-content">
                        <button className="modal-close" onClick={closeModal}>×</button>
                        <h2 style={{color:'var(--accent)'}}>{formData.id ? 'Редагувати' : 'Створити'}</h2>
                        <form onSubmit={handleSubmit} className="admin-form">
                            
                            {/* CLIENTS / TRAINERS FIELDS */}
                            {(modalType === 'client' || modalType === 'trainer') && (
                                <>
                                    {!formData.id && (
                                        <div className="form-row">
                                            <div className="form-group"><label>Username</label><input name="username" value={formData.username} onChange={handleInputChange} required /></div>
                                            <div className="form-group"><label>Password</label><input name="password" type="password" value={formData.password} onChange={handleInputChange} required /></div>
                                        </div>
                                    )}
                                    <div className="form-group"><label>Name</label><input name="name" value={formData.name} onChange={handleInputChange} required /></div>
                                    <div className="form-group"><label>Phone</label><input name="phone" value={formData.phone} onChange={handleInputChange} /></div>
                                    
                                    {modalType === 'client' && (
                                        <>
                                            <div className="form-group"><label>Email</label><input name="email" type="email" value={formData.email} onChange={handleInputChange} required /></div>
                                            <div className="form-group"><label>Status</label>
                                                <select name="status" value={formData.status} onChange={handleInputChange}>
                                                    <option value="active">Active</option><option value="inactive">Inactive</option>
                                                </select>
                                            </div>
                                        </>
                                    )}
                                    {modalType === 'trainer' && (
                                        <div className="form-group"><label>Specialization</label><input name="specialization" value={formData.specialization} onChange={handleInputChange} required /></div>
                                    )}
                                </>
                            )}

                            {/* EVENT FIELDS */}
                            {modalType === 'event' && (
                                <>
                                    <div className="form-group">
                                        <label>Тип заняття</label>
                                        <select name="class_type_id" value={formData.class_type_id} onChange={handleInputChange} required>
                                            <option value="">Оберіть тип</option>
                                            {workoutTypes.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Тренер</label>
                                        <select name="instructor_id" value={formData.instructor_id} onChange={handleInputChange} required>
                                            <option value="">Оберіть тренера</option>
                                            {trainers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group"><label>Початок</label><input type="datetime-local" name="start" value={formData.start} onChange={handleInputChange} required /></div>
                                        <div className="form-group"><label>Кінець</label><input type="datetime-local" name="end" value={formData.end} onChange={handleInputChange} required /></div>
                                    </div>
                                    <div className="form-group"><label>Місця</label><input type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} /></div>
                                </>
                            )}

                            <div className="modal-actions">
                                {formData.id && <button type="button" className="btn btn-danger" onClick={handleDelete}>Видалити</button>}
                                <button type="submit" className="btn btn-primary">Зберегти</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}