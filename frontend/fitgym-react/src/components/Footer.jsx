// src/components/Footer.jsx
export default function Footer() {
    return (
        <footer className="site-footer" id="footer-main">
            <div className="container footer-grid">
                <div className="footer-col footer-branding">
                    <div className="logo-footer">FIT<span>GYM</span></div>
                    <p className="tagline">фітнес для всіх і кожного</p>
                    <div className="social-links">
                        <a href="#"><i className="fab fa-facebook-f"></i></a>
                        <a href="#"><i className="fab fa-instagram"></i></a>
                        <a href="#"><i className="fab fa-telegram-plane"></i></a>
                    </div>
                </div>

                <div className="footer-col">
                    <h3>Про клуб</h3>
                    <ul>
                        <li><a href="#">Клуби</a></li>
                        <li><a href="#trainers">Тренери</a></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <h3>Для користувачів</h3>
                    <ul>
                        <li><a href="#">Правила</a></li>
                        <li><a href="#">Публічна оферта</a></li>
                    </ul>
                </div>
            </div>

            <div className="container footer-bottom">
                <div className="copyright">
                    © 2025 FITGYM. Усі права захищено.
                </div>
            </div>
        </footer>
    );
}