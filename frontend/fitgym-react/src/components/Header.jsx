// src/components/Header.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useState, useEffect } from 'react';

export default function Header() {
    const { user, logout } = useAuth();
    const { openLogin, openRegister } = useUI();
    
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Ефект для відстеження скролу (щоб змінювати колір хедера)
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Функція закриття меню після кліку (для мобільного)
    const closeMenu = () => setMobileMenuOpen(false);

    return (
        <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
            <div className="container header-inner">
                {/* ЛОГОТИП */}
                <Link to="/" className="logo" onClick={closeMenu}>
                    FIT<span>GYM</span>
                </Link>
                
                {/* НАВІГАЦІЯ */}
                {/* Додаємо клас 'open', якщо меню активне */}
                <nav className={`nav-primary ${mobileMenuOpen ? 'open' : ''}`}>
                    <Link to="/" onClick={closeMenu}>Головна</Link>
                    <a href="/#schedule" onClick={closeMenu}>Розклад</a>
                    <a href="/#trainers" onClick={closeMenu}>Тренери</a>
                    <a href="/#plans" onClick={closeMenu}>Абонементи</a>
                    
                    {user?.is_staff && (
                        <Link to="/admin" onClick={closeMenu} style={{ color: 'var(--accent)' }}>
                            <i className="fas fa-cogs"></i> Адмін
                        </Link>
                    )}
                    
                    {user && (
                         <Link to="/cabinet" onClick={closeMenu}>
                             <i className="fas fa-user-circle"></i> Кабінет
                         </Link>
                    )}

                    {/* На мобільному дублюємо кнопку виходу/входу в меню для зручності */}
                    <div className="mobile-auth-actions">
                        {user ? (
                            <button onClick={() => { logout(); closeMenu(); }} className="btn btn-ghost">Вийти</button>
                        ) : (
                            <>
                                <button className="btn btn-ghost" onClick={() => { openLogin(); closeMenu(); }}>Вхід</button>
                                <button className="btn btn-primary" onClick={() => { openRegister(); closeMenu(); }}>Реєстрація</button>
                            </>
                        )}
                    </div>
                </nav>

                {/* ПРАВА ЧАСТИНА (Десктоп) */}
                <div id="authArea">
                    {user ? (
                        <div className="user-greeting">
                            <span className="hide-on-mobile">Привіт, <b>{user.username}</b></span>
                            <button onClick={logout} className="btn-icon-logout" title="Вихід">
                                <i className="fas fa-sign-out-alt"></i>
                            </button>
                        </div>
                    ) : (
                        <div className="guest-actions">
                            <button className="nav-link-btn" onClick={openLogin}>Вхід</button>
                            <button className="btn btn-primary btn-sm" onClick={openRegister}>Реєстрація</button>
                        </div>
                    )}
                </div>

                {/* БУРГЕР КНОПКА */}
                <button 
                    className={`hamburger ${mobileMenuOpen ? 'active' : ''}`} 
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <span></span><span></span><span></span>
                </button>
            </div>
        </header>
    );
}