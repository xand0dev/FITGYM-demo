export default function AdminTopbar({ user, sidebarOpen, setSidebarOpen }) {
    return (
        <header className="admin-topbar">
            <button className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <h2 className="topbar-title">Панель керування</h2>
            <div className="admin-user">
                <span>{user?.username || 'Адмін'}</span>
                <div className="avatar">
                    {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
                </div>
            </div>
        </header>
    );
}