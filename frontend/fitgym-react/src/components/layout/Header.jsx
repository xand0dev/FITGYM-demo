import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useState, useEffect } from 'react';


export default function Header() {
    const { user, logout } = useAuth();
    const { openLogin, openRegister } = useUI();
    
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const closeMenu = () => setMobileMenuOpen(false);

    return (
        <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
            <div className="container header-inner">
                {/* ЛОГОТИП */}
                <Link to="/" className="logo" onClick={closeMenu}>
                    FIT<span>GYM</span>
                </Link>
                
                {/* НАВІГАЦІЯ */}
                <nav className={`nav-primary ${mobileMenuOpen ? 'open' : ''}`}>
                    <Link to="/" onClick={closeMenu}>Головна</Link>
                    <a href="/#schedule" onClick={closeMenu}>Розклад</a>
                    <a href="/#trainers" onClick={closeMenu}>Тренери</a>
                    <a href="/#plans" onClick={closeMenu}>Абонементи</a>
                    
                    {user?.is_staff && (
                        <Link to="/admin" onClick={closeMenu} className="admin-accent">
                            <i className="fas fa-shield-alt"></i> Адмін
                        </Link>
                    )}
                </nav>

                {/* ПРАВА ЧАСТИНА (АВТОРИЗАЦІЯ) */}
                <div className="auth-zone">
                    {user ? (
                        <div className="user-pill-container">
                            <Link to="/cabinet" className="user-pill" onClick={closeMenu}>
                                <span className="pill-label">Привіт, </span>
                                <b className="pill-name">{user.username}</b>
                            </Link>
                            <button onClick={logout} className="logout-icon-btn" title="Вийти">
                                <i className="fas fa-sign-out-alt"></i>
                            </button>
                        </div>
                    ) : (
                        <div className="guest-btns">
                            <button className="login-link" onClick={openLogin}>Вхід</button>
                            <button className="btn-red-sm" onClick={openRegister}>Реєстрація</button>
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

            <style>{`
                .site-header {
                    position: fixed;
                    top: 0; left: 0; width: 100%; z-index: 1000;
                    padding: 20px 0; transition: 0.4s ease;
                }
                .site-header.scrolled {
                    background: rgba(0, 0, 0, 0.85);
                    backdrop-filter: blur(15px);
                    padding: 12px 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }
                .header-inner { display: flex; align-items: center; justify-content: space-between; }
                
                .logo { font-size: 1.8rem; font-weight: 900; color: #fff; text-decoration: none; }
                .logo span { color: #ff0000; }

                /* --- КНОПКИ ДЛЯ ГОСТЕЙ (Вхід/Реєстрація) --- */
                .guest-btns {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                .login-link {
                    background: none;
                    border: none;
                    color: #fff;
                    font-weight: 800;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    cursor: pointer;
                    transition: color 0.3s;
                    padding: 0;
                    letter-spacing: 0.5px;
                }
                .login-link:hover {
                    color: #ff0000;
                }
                .btn-red-sm {
                    background: #ff0000;
                    color: #fff;
                    border: none;
                    padding: 10px 24px;
                    border-radius: 6px;
                    font-weight: 800;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 10px rgba(255, 0, 0, 0.3);
                }
                .btn-red-sm:hover {
                    background: #cc0000;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 15px rgba(255, 0, 0, 0.5);
                }

                /* --- USER PILL - Скляний ефект --- */
                .user-pill-container { display: flex; align-items: center; gap: 10px; }
                
                .user-pill {
                    display: flex; align-items: center; gap: 8px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 6px 16px; border-radius: 30px;
                    text-decoration: none; color: #fff; transition: 0.3s;
                }
                .user-pill:hover { background: rgba(255, 255, 255, 0.1); border-color: #ff0000; }
                .pill-label { font-size: 0.8rem; opacity: 0.7; }
                .pill-name { color: #ff0000; text-transform: uppercase; font-weight: 900; }

                .logout-icon-btn {
                    background: none; border: none; color: #fff; opacity: 0.7;
                    font-size: 1.2rem; cursor: pointer; transition: 0.3s;
                    display: flex; align-items: center;
                }
                .logout-icon-btn:hover { color: #ff0000; opacity: 1; transform: scale(1.1); }

                .admin-accent { color: #ff0000 !important; font-weight: 800; }

                /* --- HAMBURGER --- */
                .hamburger { display: none; background: transparent; border: none; cursor: pointer; }
                .hamburger span { display: block; width: 25px; height: 3px; background: #fff; margin: 5px 0; transition: 0.4s; }
                .hamburger.active span:nth-child(1) { transform: rotate(-45deg) translate(-5px, 6px); }
                .hamburger.active span:nth-child(2) { opacity: 0; }
                .hamburger.active span:nth-child(3) { transform: rotate(45deg) translate(-5px, -6px); }

                /* --- МЕДІА ЗАПИТИ (МОБІЛЬНІ) --- */
                @media (max-width: 991px) {
                    .hamburger { display: block; }
                    .nav-primary {
                        position: fixed; top: 0; right: -100%; width: 280px; height: 100vh;
                        background: #000; flex-direction: column; padding: 100px 40px; transition: 0.5s;
                    }
                    .nav-primary.open { right: 0; }
                    
                    /* Ховаємо кнопки з верхньої панелі на мобільному (вони мають бути в меню, якщо треба) */
                    .auth-zone { display: none; }
                }
            `}</style>
        </header>
    );
}