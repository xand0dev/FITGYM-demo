// src/components/Layout.jsx
import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

export default function Layout({ openLogin, openRegister }) {
    return (
        <div className="page-wrapper">
            <Header openLogin={openLogin} openRegister={openRegister} />
            
            <main>
                {/* ОСЬ ТУТ МАГІЯ: Ми передаємо функції вниз у дочірні сторінки (Home)
                   через context. Тепер Home зможе їх дістати.
                */}
                <Outlet context={{ openLogin, openRegister }} />
            </main>

            <Footer />
        </div>
    );
}