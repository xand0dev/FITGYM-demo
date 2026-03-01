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

    // Допоміжний компонент для посилань
    const NavLink = ({ to, href, children, className = "" }) => {
        const baseClasses = "text-[#e0e0e0] hover:text-white text-[1.1rem] lg:text-[0.95rem] font-semibold uppercase tracking-wide transition-colors relative group py-1";
        const underline = <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full shadow-[0_0_8px_#ff0000]"></span>;
        
        if (to) {
            return <Link to={to} onClick={closeMenu} className={`${baseClasses} ${className}`}>{children}{underline}</Link>
        }
        return <a href={href} onClick={closeMenu} className={`${baseClasses} ${className}`}>{children}{underline}</a>
    };

    return (
        <header className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-300 ${isScrolled ? 'bg-black/90 backdrop-blur-md py-3 border-b border-white/10 shadow-lg' : 'bg-gradient-to-b from-black/80 to-transparent py-5'}`}>
            <div className="container mx-auto px-5 lg:px-8 flex items-center justify-between">
                
                {/* ЛІВА ЧАСТИНА: Логотип (займає 1 рівну частину простору) */}
                <div className="flex-1 flex justify-start z-[1002]">
                    <Link to="/" className="text-[1.8rem] font-black text-white no-underline uppercase tracking-wide flex items-center" onClick={closeMenu}>
                        FIT<span className="text-primary ml-[2px]">GYM</span>
                    </Link>
                </div>
                
                {/* ЦЕНТРАЛЬНА ЧАСТИНА: Навігація */}
                <nav className={`
                    fixed lg:static top-0 right-0 h-screen lg:h-auto w-[280px] lg:w-auto 
                    bg-black lg:bg-transparent flex flex-col lg:flex-row items-start lg:items-center 
                    pt-[100px] lg:pt-0 px-[40px] lg:px-0 gap-8 lg:gap-10 
                    transition-transform duration-500 z-[1001] 
                    ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
                `}>
                    <NavLink to="/">Головна</NavLink>
                    <NavLink href="/#schedule">Розклад</NavLink>
                    <NavLink href="/#trainers">Тренери</NavLink>
                    <NavLink href="/#plans">Абонементи</NavLink>
                    
                    {user?.is_staff && (
                        <Link to="/admin" onClick={closeMenu} className="text-primary font-extrabold uppercase text-[1.1rem] lg:text-[0.95rem] flex items-center gap-2 group relative">
                            <i className="fas fa-shield-alt"></i> Адмін
                            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full shadow-[0_0_8px_#ff0000]"></span>
                        </Link>
                    )}

                    {/* Авторизація ТІЛЬКИ для мобільного меню */}
                    <div className="flex flex-col w-full gap-4 mt-4 lg:hidden border-t border-white/10 pt-8">
                        {user ? (
                            <>
                                <div className="text-white mb-2 opacity-70 text-sm uppercase tracking-wide">Користувач: <span className="text-primary font-bold">{user.username}</span></div>
                                <button onClick={() => { logout(); closeMenu(); }} className="w-full border border-primary text-primary font-bold py-3 rounded-md uppercase hover:bg-primary hover:text-white transition-colors">Вийти</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => { openLogin(); closeMenu(); }} className="w-full bg-white/10 text-white font-bold py-3 rounded-md uppercase hover:bg-white/20 transition-colors">Вхід</button>
                                <button onClick={() => { openRegister(); closeMenu(); }} className="w-full bg-primary text-white font-bold py-3 rounded-md uppercase shadow-[0_4px_10px_rgba(255,0,0,0.3)]">Реєстрація</button>
                            </>
                        )}
                    </div>
                </nav>

                {/* ПРАВА ЧАСТИНА: Авторизація (займає 1 рівну частину простору) */}
                <div className="flex-1 flex justify-end items-center gap-5 z-[1002]">
                    <div className="hidden lg:flex items-center gap-5">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <Link to="/cabinet" className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-white transition-colors hover:bg-white/10 hover:border-primary">
                                    <span className="text-xs opacity-70">Привіт, </span>
                                    <b className="text-primary uppercase font-black">{user.username}</b>
                                </Link>
                                <button onClick={logout} className="text-white/70 text-xl transition-all hover:text-primary hover:scale-110 flex items-center" title="Вийти">
                                    <i className="fas fa-sign-out-alt"></i>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-5">
                                <button className="bg-transparent border-none text-white font-extrabold text-[0.9rem] uppercase cursor-pointer transition-colors tracking-wide hover:text-primary" onClick={openLogin}>Вхід</button>
                                <button className="bg-primary text-white border-none px-6 py-2.5 rounded-md font-extrabold text-[0.9rem] uppercase cursor-pointer transition-all duration-300 shadow-[0_4px_10px_rgba(255,0,0,0.3)] hover:bg-[#cc0000] hover:-translate-y-0.5 hover:shadow-[0_6px_15px_rgba(255,0,0,0.5)]" onClick={openRegister}>Реєстрація</button>
                            </div>
                        )}
                    </div>

                    {/* БУРГЕР КНОПКА (МОБІЛЬНА) - Завжди вирівняна по правому краю */}
                    <button 
                        className="lg:hidden flex flex-col justify-between w-[26px] h-[18px] bg-transparent border-none cursor-pointer relative ml-4"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <span className={`w-full h-[3px] bg-white rounded-sm transition-all duration-300 origin-center ${mobileMenuOpen ? 'rotate-45 translate-y-[7.5px] !bg-primary' : ''}`}></span>
                        <span className={`w-full h-[3px] bg-white rounded-sm transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
                        <span className={`w-full h-[3px] bg-white rounded-sm transition-all duration-300 origin-center ${mobileMenuOpen ? '-rotate-45 -translate-y-[7.5px] !bg-primary' : ''}`}></span>
                    </button>
                </div>
            </div>
        </header>
    );
}