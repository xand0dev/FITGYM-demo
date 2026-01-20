// src/components/Header.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext'; // <--- 1. Імпортуємо хук UI
import { useState } from 'react';

export default function Header() {
    const { user, logout } = useAuth();
    
    // 2. Беремо функції відкриття вікон з глобального контексту
    const { openLogin, openRegister } = useUI(); 
    
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="site-header">
            <div className="container header-inner">
                <div className="logo">FIT<span>GYM</span></div>
                
                {/* Меню навігації */}
                <nav 
                    className="nav-primary" 
                    style={{ 
                        // Якщо меню відкрите - показуємо flex. 
                        // undefined залишає поведінку CSS за замовчуванням (щоб не ховати меню на ПК)
                        display: mobileMenuOpen ? 'flex' : undefined 
                    }}
                >
                    <Link to="/">Головна</Link>
                    <a href="/#schedule">Розклад</a>
                    <a href="/#trainers">Тренери</a>
                    <a href="/#plans">Абонементи</a>
                    
                    {/* Посилання для Адміна */}
                    {user?.is_staff && (
                        <Link to="/admin" style={{ color: 'var(--accent)' }}>Адмін</Link>
                    )}
                    
                    {/* Посилання в Кабінет */}
                    {user && (
                         <Link to="/cabinet">Кабінет</Link>
                    )}
                </nav>

                {/* Зона авторизації */}
                <div id="authArea">
                    {user ? (
                        <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                            <span style={{color:'#fff'}} className="hide-on-mobile">
                                Привіт, <b>{user.username}</b>
                            </span>
                            <button onClick={logout} className="btn btn-primary" title="Вихід">
                                <i className="fas fa-sign-out-alt"></i>
                            </button>
                        </div>
                    ) : (
                        <div id="guestArea">
                            {/* 3. Кнопки тепер викликають функції з useUI */}
                            <button className="btn btn-ghost" onClick={openLogin}>ВХІД</button>
                            <button className="btn btn-primary" onClick={openRegister}>РЕЄСТРАЦІЯ</button>
                        </div>
                    )}
                </div>

                {/* Мобільна кнопка (бургер) */}
                <button className="hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    <span></span><span></span><span></span>
                </button>
            </div>
        </header>
    );
}