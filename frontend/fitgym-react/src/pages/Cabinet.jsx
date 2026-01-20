// src/pages/Cabinet.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authRequest } from '../utils/api';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Cabinet() {
    const { user, logout } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        AOS.init();
        loadSchedule();
    }, []);

    const loadSchedule = async () => {
        try {
            // Запит на отримання моїх тренувань
            const data = await authRequest('/api/my-bookings/');
            setBookings(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Помилка завантаження бронювань:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!confirm('Ви впевнені, що хочете скасувати запис?')) return;
        try {
            await authRequest(`/api/my-bookings/${id}/`, 'DELETE');
            // Прибираємо видалене тренування зі списку без перезавантаження
            setBookings(bookings.filter(b => b.id !== id));
        } catch (e) {
            alert('Помилка: ' + e.message);
        }
    };

    return (
        <section id="cabinet" className="section container" style={{minHeight: '80vh'}}>
            <h2 className="section-title" data-aos="fade-up">Особистий Кабінет</h2>

            <div className="cabinet-grid">
                {/* --- ЛІВА КОЛОНКА: ПРОФІЛЬ --- */}
                <div className="profile-card" data-aos="fade-right">
                    <div className="profile-header">
                        {/* Аватар (заглушка або реальний, якщо є) */}
                        <img 
                            id="user-avatar" 
                            src="/img/муж1.png" 
                            alt="User" 
                            className="user-avatar" 
                            onError={(e) => e.target.src = 'https://via.placeholder.com/100'}
                        />
                        <h3 id="user-name">{user?.username || 'Клієнт'}</h3>
                        <p className="user-role">
                            {user?.is_staff ? 'Адміністратор' : 'Учасник клубу'}
                        </p>
                    </div>
                    
                    <div className="profile-details">
                        <p><i className="fas fa-user"></i> <span>{user?.first_name} {user?.last_name}</span></p>
                        <p><i className="fas fa-envelope"></i> <span>{user?.email}</span></p>
                        <p><i className="fas fa-phone"></i> <span>{user?.contact || user?.phone || 'Не вказано'}</span></p>
                    </div>

                    <button onClick={logout} className="btn btn-primary" style={{marginTop: '20px', width: '100%'}}>
                        <i className="fas fa-sign-out-alt"></i> Вийти
                    </button>
                </div>

                {/* --- ПРАВА КОЛОНКА: СПИСОК ТРЕНУВАНЬ --- */}
                <div className="schedule-card" data-aos="fade-left">
                    <h3 className="schedule-title">Мої тренування</h3>
                    
                    <div className="user-schedule-list">
                        {loading ? (
                            <p className="text-center">Завантаження...</p>
                        ) : bookings.length === 0 ? (
                            <div className="text-center" style={{padding: '20px', color: '#888'}}>
                                <i className="fas fa-calendar-times fa-3x" style={{marginBottom:'10px'}}></i>
                                <p>У вас поки немає активних записів.</p>
                            </div>
                        ) : (
                            bookings.map(item => (
                                <div key={item.id} className="booking-card">
                                    <div className="booking-info">
                                        <h4>{item.session?.class_name || 'Тренування'}</h4>
                                        <p>
                                            <i className="far fa-clock"></i> {new Date(item.session?.start_at).toLocaleString('uk-UA')}
                                        </p>
                                        <p>
                                            <i className="fas fa-user-ninja"></i> Тренер: {item.session?.instructor_name || 'Черговий'}
                                        </p>
                                        <span>Статус: <strong>{item.status || 'Active'}</strong></span>
                                    </div>
                                    
                                    <button 
                                        className="btn-cancel" 
                                        onClick={() => handleCancel(item.id)}
                                        title="Скасувати запис"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <a href="/#schedule" className="btn btn-ghost" style={{width: '100%', marginTop: '20px', textAlign:'center'}}>
                        <i className="fas fa-calendar-plus"></i> Записатись ще
                    </a>
                </div>
            </div>
        </section>
    );
}