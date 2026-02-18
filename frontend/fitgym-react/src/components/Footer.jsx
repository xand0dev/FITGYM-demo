import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container footer-content">
                <div className="footer-grid">
                    
                    {/* Лого та опис */}
                    <div className="footer-brand">
                        <h2 className="footer-logo">FIT<span>GYM</span></h2>
                        <p className="footer-about">
                            Найсучасніший фітнес-центр у Бердичеві. Твій результат — наш пріоритет. 
                            Працюємо 24/7 для твоєї досконалості.
                        </p>
                        <div className="footer-socials">
                            <a href="#"><i className="fab fa-instagram"></i></a>
                            <a href="#"><i className="fab fa-facebook-f"></i></a>
                            <a href="#"><i className="fab fa-tiktok"></i></a>
                        </div>
                    </div>

                    {/* Навігація */}
                    <div className="footer-links">
                        <h4>Навігація</h4>
                        <ul>
                            <li><a href="#categories">Тренування</a></li>
                            <li><a href="#trainers">Тренери</a></li>
                            <li><a href="#plans">Тарифи</a></li>
                            <li><a href="#schedule">Розклад</a></li>
                        </ul>
                    </div>

                    {/* Контакти */}
                    <div className="footer-contacts">
                        <h4>Контакти</h4>
                        <p><i className="fas fa-map-marker-alt"></i> м. Бердичів, вул. Європейська, 15</p>
                        <p><i className="fas fa-phone"></i> +38 (097) 123-45-67</p>
                        <p><i className="fas fa-envelope"></i> info@fitgym.ua</p>
                    </div>

                </div>

                <div className="footer-bottom">
                    <p>&copy; 2026 FITGYM BERDYCHIV. Всі права захищені.</p>
                   
                </div>
            </div>

            <style>{`
                .footer {
                    background: #000;
                    color: #fff;
                    padding: 80px 0 30px;
                    border-top: 5px solid #ff0000;
                }
                .footer-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1.5fr;
                    gap: 60px;
                    margin-bottom: 60px;
                }
                .footer-logo {
                    font-size: 2.5rem;
                    font-weight: 950;
                    margin-bottom: 20px;
                    letter-spacing: -2px;
                }
                .footer-logo span { color: #ff0000; }
                .footer-about { color: #888; line-height: 1.6; max-width: 350px; }
                
                .footer-links h4, .footer-contacts h4 {
                    text-transform: uppercase;
                    font-weight: 900;
                    margin-bottom: 25px;
                    letter-spacing: 1px;
                }
                .footer-links ul { list-style: none; padding: 0; }
                .footer-links li { margin-bottom: 12px; }
                .footer-links a { 
                    color: #888; 
                    text-decoration: none; 
                    transition: 0.3s;
                    font-weight: 600;
                }
                .footer-links a:hover { color: #ff0000; padding-left: 5px; }

                .footer-contacts p { 
                    color: #888; 
                    margin-bottom: 15px; 
                    display: flex; 
                    align-items: center; 
                    gap: 12px; 
                }
                .footer-contacts i { color: #ff0000; }

                .footer-socials { display: flex; gap: 20px; margin-top: 25px; }
                .footer-socials a { 
                    width: 40px; height: 40px; 
                    background: #222; 
                    display: flex; align-items: center; justify-content: center;
                    color: #fff; text-decoration: none;
                    transition: 0.3s;
                }
                .footer-socials a:hover { background: #ff0000; transform: translateY(-5px); }

                .footer-bottom {
                    border-top: 1px solid #222;
                    padding-top: 30px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: #444;
                    font-size: 0.9rem;
                    font-weight: 700;
                }
                .developer span { color: #666; }

                @media (max-width: 768px) {
                    .footer-grid { grid-template-columns: 1fr; gap: 40px; text-align: center; }
                    .footer-about { margin: 0 auto; }
                    .footer-socials { justify-content: center; }
                    .footer-bottom { flex-direction: column; gap: 10px; }
                }
            `}</style>
        </footer>
    );
}