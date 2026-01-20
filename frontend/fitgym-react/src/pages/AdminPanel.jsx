// src/pages/AdminPanel.jsx
import { useState, useEffect } from 'react';
import { authRequest } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function AdminPanel() {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'schedule', 'clients', 'trainers'
    
    // --- STATE ДЛЯ ТРЕНЕРІВ ---
    const [trainers, setTrainers] = useState([]);
    const [isTrainerModalOpen, setIsTrainerModalOpen] = useState(false);
    const [trainerForm, setTrainerForm] = useState({
        id: null,
        username: '', password: '', 
        name: '', specialization: '', phone: ''
    });

    // Завантаження даних при зміні вкладки
    useEffect(() => {
        if (activeTab === 'trainers') loadTrainers();
    }, [activeTab]);

    // --- ЛОГІКА ТРЕНЕРІВ ---
    const loadTrainers = async () => {
        try {
            const data = await authRequest('/api/admin/instructors/');
            setTrainers(data);
        } catch (e) { console.error(e); }
    };

    const handleTrainerSubmit = async (e) => {
        e.preventDefault();
        // Розбиваємо ім'я
        const nameParts = trainerForm.name.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        const payload = {
            first_name: firstName,
            last_name: lastName,
            specialties: trainerForm.specialization,
            contact: trainerForm.phone
        };

        try {
            if (trainerForm.id) {
                // UPDATE
                await authRequest(`/api/admin/instructors/${trainerForm.id}/`, 'PUT', payload);
            } else {
                // CREATE
                payload.username = trainerForm.username;
                payload.password = trainerForm.password;
                await authRequest('/api/admin/instructors/', 'POST', payload);
            }
            setIsTrainerModalOpen(false);
            loadTrainers();
        } catch (err) { alert(err.message); }
    };

    const handleDeleteTrainer = async (id) => {
        if (!confirm('Видалити тренера?')) return;
        try {
            await authRequest(`/api/admin/instructors/${id}/`, 'DELETE');
            loadTrainers();
        } catch (e) { alert(e.message); }
    };

    const openTrainerModal = (trainer = null) => {
        if (trainer) {
            setTrainerForm({
                id: trainer.id,
                username: '', password: '',
                name: trainer.full_name || trainer.name,
                specialization: trainer.specialties || trainer.specialization,
                phone: trainer.contact || trainer.phone
            });
        } else {
            setTrainerForm({ id: null, username: '', password: '', name: '', specialization: '', phone: '' });
        }
        setIsTrainerModalOpen(true);
    };

    // --- RENDER ---
    return (
        <div className="dashboard-container">
            <aside className="dashboard-sidebar">
                <div className="sidebar-logo">FIT<span>GYM</span> ADMIN</div>
                <nav className="sidebar-menu">
                    <button 
                        className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        <i className="fas fa-chart-line"></i> Огляд
                    </button>
                    <button 
                        className={`menu-item ${activeTab === 'schedule' ? 'active' : ''}`}
                        onClick={() => setActiveTab('schedule')}
                    >
                        <i className="fas fa-calendar-alt"></i> Розклад
                    </button>
                    <button 
                        className={`menu-item ${activeTab === 'clients' ? 'active' : ''}`}
                        onClick={() => setActiveTab('clients')}
                    >
                        <i className="fas fa-users"></i> Клієнти
                    </button>
                    <button 
                        className={`menu-item ${activeTab === 'trainers' ? 'active' : ''}`}
                        onClick={() => setActiveTab('trainers')}
                    >
                        <i className="fas fa-dumbbell"></i> Тренери
                    </button>
                </nav>
                <div className="sidebar-footer">
                    <button className="menu-item logout-link" onClick={logout}>
                        <i className="fas fa-sign-out-alt"></i> Вихід
                    </button>
                </div>
            </aside>

            <main className="dashboard-main">
                <header className="dashboard-topbar">
                    <h2>Панель керування</h2>
                    <div className="admin-profile"><span>Адміністратор</span></div>
                </header>

                {/* --- ВМІСТ ВКЛАДОК --- */}
                
                {activeTab === 'dashboard' && (
                    <section className="content-section active">
                        <div className="stats-grid">
                            <div className="stat-card"><h3>Клієнтів</h3><div className="value">124</div></div>
                            <div className="stat-card"><h3>Дохід</h3><div className="value">₴ 45,200</div></div>
                        </div>
                    </section>
                )}

                {activeTab === 'trainers' && (
                    <section className="content-section active">
                        <div className="card">
                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}>
                                <h3>Управління персоналом</h3>
                                <button className="btn btn-primary" onClick={() => openTrainerModal(null)}>+ Додати</button>
                            </div>
                            <table className="data-table">
                                <thead><tr><th>Ім'я</th><th>Спец.</th><th>Телефон</th><th>Дії</th></tr></thead>
                                <tbody>
                                    {trainers.map(t => (
                                        <tr key={t.id}>
                                            <td>{t.full_name || t.name}</td>
                                            <td>{t.specialties || t.specialization}</td>
                                            <td>{t.contact || t.phone}</td>
                                            <td>
                                                <button onClick={() => openTrainerModal(t)} style={{marginRight:'10px'}}><i className="fas fa-edit"></i></button>
                                                <button onClick={() => handleDeleteTrainer(t.id)} style={{color:'red'}}><i className="fas fa-trash"></i></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* --- ІНШІ ВКЛАДКИ (Заглушки) --- */}
                {activeTab === 'schedule' && <div className="card"><h2>Розклад (В розробці...)</h2></div>}
                {activeTab === 'clients' && <div className="card"><h2>Клієнти (В розробці...)</h2></div>}

            </main>

            {/* МОДАЛКА ТРЕНЕРА */}
            {isTrainerModalOpen && (
                <div className="modal-overlay" style={{display:'flex'}}>
                    <div className="modal-content">
                        <button className="modal-close" onClick={() => setIsTrainerModalOpen(false)}>×</button>
                        <h2>{trainerForm.id ? 'Редагувати' : 'Новий'} Тренер</h2>
                        <form onSubmit={handleTrainerSubmit} className="admin-form">
                            {!trainerForm.id && (
                                <>
                                    <div className="form-group">
                                        <label>Логін</label>
                                        <input required value={trainerForm.username} onChange={e => setTrainerForm({...trainerForm, username: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Пароль</label>
                                        <input type="password" required value={trainerForm.password} onChange={e => setTrainerForm({...trainerForm, password: e.target.value})} />
                                    </div>
                                    <hr style={{margin:'15px 0', borderTop:'1px solid #333'}}/>
                                </>
                            )}
                            <div className="form-group">
                                <label>Ім'я</label>
                                <input required value={trainerForm.name} onChange={e => setTrainerForm({...trainerForm, name: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Спеціалізація</label>
                                <input required value={trainerForm.specialization} onChange={e => setTrainerForm({...trainerForm, specialization: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Телефон</label>
                                <input value={trainerForm.phone} onChange={e => setTrainerForm({...trainerForm, phone: e.target.value})} />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{width:'100%', marginTop:'10px'}}>Зберегти</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}