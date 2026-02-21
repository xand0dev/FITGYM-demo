export default function AdminSidebar({ activeTab, setActiveTab, sidebarOpen, logout }) {
    return (
        <aside className={`admin-sidebar ${sidebarOpen ? 'active' : ''}`}>
            <div className="admin-logo">FIT<span>GYM</span></div>
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
            <div className="admin-footer">
                <button onClick={logout}><i className="fas fa-sign-out-alt"></i> Вихід</button>
            </div>
        </aside>
    );
}