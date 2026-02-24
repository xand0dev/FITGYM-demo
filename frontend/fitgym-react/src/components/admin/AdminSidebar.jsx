import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar({ activeTab, setActiveTab, sidebarOpen, logout }) {
    // Підключаємо наш когітатор для ідентифікації
    const { user } = useAuth();
    const isSuperAdmin = user?.is_superuser;

    return (
        <aside className={`admin-sidebar ${sidebarOpen ? 'active' : ''}`}>
            <div className="admin-logo">FIT<span>GYM</span></div>
            
            {/* Мікро-бейдж для перевірки статусу (без зламу CSS) */}
            <div style={{ textAlign: 'center', color: isSuperAdmin ? '#ff0000' : '#888', fontSize: '11px', fontWeight: '900', marginBottom: '20px', letterSpacing: '2px' }}>
                {isSuperAdmin ? 'АДМІНІСТРАТОР' : 'ТРЕНЕР'}
            </div>

            <nav className="admin-menu">
                {/* --- ОГЛЯД (ТІЛЬКИ ВЛАСНИК) --- */}
                {isSuperAdmin && (
                    <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
                        <i className="fas fa-chart-line"></i> Огляд
                    </button>
                )}

                {/* --- РОЗКЛАД (ДОСТУПНО ВСІМ) --- */}
                <button className={activeTab === 'schedule' ? 'active' : ''} onClick={() => setActiveTab('schedule')}>
                    <i className="fas fa-calendar-alt"></i> Розклад
                </button>

                {/* --- КЛІЄНТИ (ДОСТУПНО ВСІМ) --- */}
                <button className={activeTab === 'clients' ? 'active' : ''} onClick={() => setActiveTab('clients')}>
                    <i className="fas fa-users"></i> Клієнти
                </button>

                {/* --- ТРЕНЕРИ (ТІЛЬКИ ВЛАСНИК) --- */}
                {isSuperAdmin && (
                    <button className={activeTab === 'trainers' ? 'active' : ''} onClick={() => setActiveTab('trainers')}>
                        <i className="fas fa-dumbbell"></i> Тренери
                    </button>
                )}
            </nav>

            <div className="admin-footer">
                <button onClick={logout}>
                    <i className="fas fa-sign-out-alt"></i> Вихід
                </button>
            </div>
        </aside>
    );
}